from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import numpy as np
from collections import defaultdict
import warnings

warnings.filterwarnings("ignore")

app = FastAPI(
    title="Benkyo FSRS Optimizer",
    description="Optimizes FSRS algorithm weights based on user review history",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEFAULT_WEIGHTS = [
    0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046,
    1.54575, 0.1192, 1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315,
    2.9898, 0.51655, 0.6621
]

WEIGHT_DESCRIPTIONS = [
    "w0: Initial stability for Again",
    "w1: Initial stability for Hard", 
    "w2: Initial stability for Good",
    "w3: Initial stability for Easy",
    "w4: Initial difficulty",
    "w5: Initial difficulty rating modifier",
    "w6: Difficulty change rate",
    "w7: Difficulty mean reversion",
    "w8: Stability growth base",
    "w9: Stability decay rate",
    "w10: Retrievability bonus",
    "w11: Failure stability base",
    "w12: Failure difficulty factor",
    "w13: Failure stability factor",
    "w14: Failure retrievability factor",
    "w15: Hard penalty",
    "w16: Easy bonus",
    "w17: Short-term factor",
    "w18: Short-term modifier"
]


class ReviewLog(BaseModel):
    card_id: str
    review_time: int = Field(..., description="Unix timestamp in milliseconds")
    review_rating: int = Field(..., ge=1, le=4, description="1=Again, 2=Hard, 3=Good, 4=Easy")
    review_state: int = Field(..., ge=0, le=3, description="0=New, 1=Learning, 2=Review, 3=Relearning")
    review_duration: Optional[int] = Field(default=0, description="Review duration in milliseconds")


class OptimizeRequest(BaseModel):
    review_logs: List[ReviewLog]
    timezone: str = Field(default="UTC", description="IANA timezone string")
    day_start: int = Field(default=4, ge=0, le=23, description="Hour at which a new day starts")


class OptimizeResponse(BaseModel):
    success: bool
    weights: List[float]
    message: str
    review_count: int
    retention_rate: Optional[float] = None


def analyze_reviews(review_logs: List[ReviewLog]) -> Dict:
    card_reviews: Dict[str, List[ReviewLog]] = defaultdict(list)
    for log in review_logs:
        card_reviews[log.card_id].append(log)
    
    for card_id in card_reviews:
        card_reviews[card_id].sort(key=lambda x: x.review_time)
    
    stats = {
        'total_reviews': len(review_logs),
        'unique_cards': len(card_reviews),
        'cards_with_repeats': 0,
        'first_review_ratings': {1: 0, 2: 0, 3: 0, 4: 0},
        'all_ratings': {1: 0, 2: 0, 3: 0, 4: 0},
        'success_after_intervals': [],
        'repeat_intervals': [],
    }
    
    for card_id, reviews in card_reviews.items():
        first_rating = reviews[0].review_rating
        stats['first_review_ratings'][first_rating] = stats['first_review_ratings'].get(first_rating, 0) + 1
        
        for r in reviews:
            stats['all_ratings'][r.review_rating] = stats['all_ratings'].get(r.review_rating, 0) + 1
        
        if len(reviews) > 1:
            stats['cards_with_repeats'] += 1
            
            for i in range(1, len(reviews)):
                interval_ms = reviews[i].review_time - reviews[i-1].review_time
                interval_days = interval_ms / (1000 * 60 * 60 * 24)
                was_success = reviews[i].review_rating > 1
                stats['success_after_intervals'].append((interval_days, was_success))
                stats['repeat_intervals'].append(interval_days)
    
    return stats


def calculate_retention_rate(stats: Dict) -> float:
    total = sum(stats['all_ratings'].values())
    if total == 0:
        return 0.85
    
    success = stats['all_ratings'].get(2, 0) + stats['all_ratings'].get(3, 0) + stats['all_ratings'].get(4, 0)
    return success / total


def optimize_weights(review_logs: List[ReviewLog]) -> tuple[List[float], float, str]:
    if len(review_logs) < 50:
        return DEFAULT_WEIGHTS.copy(), 0.0, f"Insufficient data ({len(review_logs)} reviews). Need at least 50."
    
    stats = analyze_reviews(review_logs)
    retention_rate = calculate_retention_rate(stats)
    
    weights = DEFAULT_WEIGHTS.copy()
    
    total_first = sum(stats['first_review_ratings'].values())
    if total_first == 0:
        return weights, retention_rate, "No first reviews found"
    
    again_ratio = stats['first_review_ratings'].get(1, 0) / total_first
    if again_ratio > 0.3:
        weights[0] = max(0.1, DEFAULT_WEIGHTS[0] * 0.7)
    elif again_ratio < 0.1:
        weights[0] = min(1.0, DEFAULT_WEIGHTS[0] * 1.2)
    
    hard_ratio = stats['first_review_ratings'].get(2, 0) / total_first
    if hard_ratio > 0.3:
        weights[1] = DEFAULT_WEIGHTS[1] * 0.9
    elif hard_ratio < 0.1:
        weights[1] = DEFAULT_WEIGHTS[1] * 1.1
    
    good_ratio = stats['first_review_ratings'].get(3, 0) / total_first
    if good_ratio > 0.5:
        weights[2] = min(5.0, DEFAULT_WEIGHTS[2] * 1.2)
    elif good_ratio < 0.3:
        weights[2] = max(1.5, DEFAULT_WEIGHTS[2] * 0.9)
    
    easy_ratio = stats['first_review_ratings'].get(4, 0) / total_first
    if easy_ratio > 0.2:
        weights[3] = min(25.0, DEFAULT_WEIGHTS[3] * 1.3)
    elif easy_ratio < 0.05:
        weights[3] = max(8.0, DEFAULT_WEIGHTS[3] * 0.85)
    
    if retention_rate > 0.92:
        weights[8] = min(2.0, DEFAULT_WEIGHTS[8] * 1.1)
        weights[10] = min(1.5, DEFAULT_WEIGHTS[10] * 1.15)
    elif retention_rate < 0.8:
        weights[8] = max(1.0, DEFAULT_WEIGHTS[8] * 0.9)
        weights[10] = max(0.7, DEFAULT_WEIGHTS[10] * 0.85)
    
    overall_again_ratio = stats['all_ratings'].get(1, 0) / stats['total_reviews']
    if overall_again_ratio > 0.2:
        weights[11] = max(1.0, DEFAULT_WEIGHTS[11] * 0.85)
    elif overall_again_ratio < 0.05:
        weights[11] = min(2.5, DEFAULT_WEIGHTS[11] * 1.1)
    
    weight_ranges = [
        (0.1, 2.0),
        (0.5, 5.0),
        (1.0, 10.0),
        (5.0, 50.0),
        (1.0, 10.0),
        (0.1, 2.0),
        (0.5, 3.0),
        (0.001, 0.5),
        (0.5, 3.0),
        (0.05, 0.5),
        (0.5, 2.0),
        (0.5, 3.0),
        (0.05, 0.3),
        (0.1, 0.5),
        (1.0, 4.0),
        (0.1, 0.5),
        (1.5, 5.0),
        (0.3, 1.0),
        (0.3, 1.0),
    ]
    
    for i, (min_val, max_val) in enumerate(weight_ranges):
        weights[i] = np.clip(weights[i], min_val, max_val)
    
    weights = [round(w, 5) for w in weights]
    
    message = (
        f"Optimized from {stats['total_reviews']} reviews across {stats['unique_cards']} cards. "
        f"Retention rate: {retention_rate:.1%}. "
        f"Cards reviewed multiple times: {stats['cards_with_repeats']}."
    )
    
    return weights, retention_rate, message


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "benkyo-optimizer"}


@app.post("/optimize", response_model=OptimizeResponse)
async def optimize_weights_endpoint(request: OptimizeRequest):
    review_count = len(request.review_logs)
    
    if review_count < 50:
        return OptimizeResponse(
            success=False,
            weights=DEFAULT_WEIGHTS,
            message=f"Insufficient review data ({review_count} reviews). Need at least 50 reviews for optimization.",
            review_count=review_count
        )
    
    try:
        weights, retention_rate, message = optimize_weights(request.review_logs)
        
        weights_changed = any(abs(w - d) > 0.001 for w, d in zip(weights, DEFAULT_WEIGHTS))
        
        return OptimizeResponse(
            success=True,
            weights=weights,
            message=message if weights_changed else f"Optimization completed but weights are similar to defaults. {message}",
            review_count=review_count,
            retention_rate=retention_rate
        )
        
    except Exception as e:
        print(f"Optimization error: {e}")
        return OptimizeResponse(
            success=False,
            weights=DEFAULT_WEIGHTS,
            message=f"Optimization error: {str(e)}. Using default weights.",
            review_count=review_count
        )


@app.get("/default-weights")
async def get_default_weights():
    return {
        "weights": DEFAULT_WEIGHTS,
        "descriptions": WEIGHT_DESCRIPTIONS
    }


@app.get("/")
async def root():
    return {
        "service": "Benkyo FSRS Optimizer",
        "version": "1.0.0",
        "endpoints": {
            "GET /health": "Health check",
            "POST /optimize": "Optimize FSRS weights",
            "GET /default-weights": "Get default weights"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
