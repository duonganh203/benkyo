import { Deck, Revlog } from '~/schemas';
import { NotFoundException } from '~/exceptions/notFound';
import { ErrorCode } from '~/exceptions/root';
import axios from 'axios';
import mongoose from 'mongoose';

const OPTIMIZER_SERVICE_URL = process.env.OPTIMIZER_SERVICE_URL || 'http://localhost:8002';
const OPTIMIZATION_THRESHOLD = 100;

interface ReviewLogForOptimizer {
    card_id: string;
    review_time: number;
    review_rating: number;
    review_state: number;
    review_duration: number;
}

interface OptimizationResult {
    success: boolean;
    weights: number[];
    message: string;
    review_count: number;
    retention_rate?: number;
}

export const incrementLearnedCardCount = async (deckId: string, userId: string): Promise<boolean> => {
    const deck = await Deck.findById(deckId);
    if (!deck) {
        throw new NotFoundException('Deck not found', ErrorCode.NOT_FOUND);
    }

    const currentCount = deck.optimization?.learnedCardCount || 0;
    const newCount = currentCount + 1;

    await Deck.findByIdAndUpdate(deckId, {
        $set: { 'optimization.learnedCardCount': newCount }
    });

    if (newCount >= OPTIMIZATION_THRESHOLD) {
        triggerOptimizationAsync(deckId, userId).catch(console.error);
        return true;
    }

    return false;
};

export const getRevlogsForOptimization = async (deckId: string, userId: string): Promise<ReviewLogForOptimizer[]> => {
    const deckObjectId = new mongoose.Types.ObjectId(deckId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const revlogs = await Revlog.aggregate([
        {
            $match: {
                user: userObjectId,
                deleted: false
            }
        },
        {
            $lookup: {
                from: 'cards',
                localField: 'card',
                foreignField: '_id',
                as: 'cardInfo'
            }
        },
        {
            $unwind: '$cardInfo'
        },
        {
            $match: {
                'cardInfo.deck': deckObjectId
            }
        },
        {
            $sort: { review: 1 }
        },
        {
            $project: {
                card_id: { $toString: '$card' },
                review_time: { $toLong: '$review' },
                review_rating: '$grade',
                review_state: '$state',
                review_duration: { $multiply: ['$duration', 1000] }
            }
        }
    ]);

    return revlogs;
};

export const triggerOptimizationAsync = async (deckId: string, userId: string): Promise<void> => {
    try {
        await Deck.findByIdAndUpdate(deckId, {
            $set: { 'optimization.optimizationStatus': 'pending' }
        });

        await runOptimization(deckId, userId);
    } catch (error) {
        console.error('Optimization failed:', error);
        await Deck.findByIdAndUpdate(deckId, {
            $set: {
                'optimization.optimizationStatus': 'failed',
                'optimization.lastOptimizationMessage': error instanceof Error ? error.message : 'Unknown error'
            }
        });
    }
};

export const runOptimization = async (deckId: string, userId: string): Promise<OptimizationResult> => {
    await Deck.findByIdAndUpdate(deckId, {
        $set: {
            'optimization.optimizationStatus': 'running',
            'optimization.lastOptimizationMessage': 'Running optimization...'
        }
    });

    const revlogs = await getRevlogsForOptimization(deckId, userId);

    if (revlogs.length < 50) {
        const result: OptimizationResult = {
            success: false,
            weights: [],
            message: `Insufficient review data (${revlogs.length} reviews). Need at least 50 reviews.`,
            review_count: revlogs.length
        };

        await Deck.findByIdAndUpdate(deckId, {
            $set: {
                'optimization.optimizationStatus': 'failed',
                'optimization.lastOptimizationMessage': result.message
            }
        });

        return result;
    }

    try {
        const response = await axios.post<OptimizationResult>(
            `${OPTIMIZER_SERVICE_URL}/optimize`,
            {
                review_logs: revlogs,
                timezone: 'Asia/Ho_Chi_Minh',
                day_start: 4
            },
            {
                timeout: 120000
            }
        );

        const result = response.data;

        if (result.success && result.weights.length === 19) {
            await Deck.findByIdAndUpdate(deckId, {
                $set: {
                    'fsrsParams.w': result.weights,
                    'optimization.learnedCardCount': 0,
                    'optimization.lastOptimized': new Date(),
                    'optimization.optimizationStatus': 'completed',
                    'optimization.lastOptimizationMessage': result.message
                }
            });
        } else {
            await Deck.findByIdAndUpdate(deckId, {
                $set: {
                    'optimization.optimizationStatus': 'failed',
                    'optimization.lastOptimizationMessage': result.message
                }
            });
        }

        return result;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to call optimizer service';

        await Deck.findByIdAndUpdate(deckId, {
            $set: {
                'optimization.optimizationStatus': 'failed',
                'optimization.lastOptimizationMessage': errorMessage
            }
        });

        throw error;
    }
};

export const triggerManualOptimization = async (deckId: string, userId: string): Promise<OptimizationResult> => {
    const deck = await Deck.findById(deckId);
    if (!deck) {
        throw new NotFoundException('Deck not found', ErrorCode.NOT_FOUND);
    }

    if (deck.optimization?.optimizationStatus === 'running' || deck.optimization?.optimizationStatus === 'pending') {
        return {
            success: false,
            weights: [],
            message: 'Optimization is already in progress',
            review_count: 0
        };
    }

    return runOptimization(deckId, userId);
};

export const getOptimizationStatus = async (deckId: string) => {
    const deck = await Deck.findById(deckId);
    if (!deck) {
        throw new NotFoundException('Deck not found', ErrorCode.NOT_FOUND);
    }

    return {
        learnedCardCount: deck.optimization?.learnedCardCount || 0,
        lastOptimized: deck.optimization?.lastOptimized,
        status: deck.optimization?.optimizationStatus || 'idle',
        message: deck.optimization?.lastOptimizationMessage,
        threshold: OPTIMIZATION_THRESHOLD
    };
};
