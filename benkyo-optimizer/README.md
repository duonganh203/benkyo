# Benkyo FSRS Optimizer

A Python FastAPI service that optimizes FSRS (Free Spaced Repetition Scheduler) weights based on user review history.

## Overview

This service uses the [fsrs-optimizer](https://github.com/open-spaced-repetition/fsrs-optimizer) package to analyze user review logs and generate personalized FSRS algorithm weights.

## Requirements

- Python 3.9+
- pip

## Installation

```bash
cd benkyo-optimizer
pip install -r requirements.txt
```

## Running Locally

```bash
# Development mode with auto-reload
uvicorn main:app --reload --port 8002

# Production mode
python main.py
```

## API Endpoints

### Health Check

```
GET /health
```

Returns service health status.

### Optimize Weights

```
POST /optimize
Content-Type: application/json

{
  "review_logs": [
    {
      "card_id": "string",
      "review_time": 1699999999000,  // Unix timestamp in ms
      "review_rating": 3,            // 1=Again, 2=Hard, 3=Good, 4=Easy
      "review_state": 2,             // 0=New, 1=Learning, 2=Review, 3=Relearning
      "review_duration": 5000        // Duration in ms (optional)
    }
  ],
  "timezone": "Asia/Ho_Chi_Minh",    // IANA timezone
  "day_start": 4                      // Hour (0-23) when day starts
}
```

Response:

```json
{
  "success": true,
  "weights": [0.4, 1.2, ...],  // 19 FSRS weights
  "message": "Successfully optimized weights from 150 reviews",
  "review_count": 150,
  "retention_rate": 0.92
}
```

### Get Default Weights

```
GET /default-weights
```

Returns the default FSRS v5 weights.

## Docker

Build and run with Docker:

```bash
docker build -t benkyo-optimizer .
docker run -p 8002:8002 benkyo-optimizer
```

## Environment Variables

| Variable | Default | Description  |
| -------- | ------- | ------------ |
| PORT     | 8002    | Service port |
| HOST     | 0.0.0.0 | Service host |

## Notes

- Requires at least 50 review logs for optimization
- Optimization may take 30-120 seconds depending on data size
- Returns default weights if optimization fails or data is insufficient
