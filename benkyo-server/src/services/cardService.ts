import mongoose from 'mongoose';
import z from 'zod';
import { ForbiddenRequestsException } from '~/exceptions/forbiddenRequests';
import { NotFoundException } from '~/exceptions/notFound';
import { ErrorCode } from '~/exceptions/root';
import { Card, Deck, Revlog, UserDeckState } from '~/schemas';
import { batchCreateCardsValidation, createCardValidation } from '~/validations/cardValidation';

export const getCardsByIds = async (cardIds: string[]) => {
    const cards = await Card.find({ _id: { $in: cardIds } });
    return cards;
};

export const getCardByIdService = async (cardId: string) => {
    const card = await Card.findById(cardId);
    if (!card) {
        throw new NotFoundException('Card not found', ErrorCode.NOT_FOUND);
    }
    return card;
};

export const updateCard = async (cardId: string, userId: string, cardData: z.infer<typeof createCardValidation>) => {
    const { front, back, tags, deckId, media } = cardData;
    const deck = await Deck.findById(deckId);
    if (!deck) {
        throw new NotFoundException('Deck not found', ErrorCode.NOT_FOUND);
    }
    if (!deck.owner.equals(userId)) {
        throw new ForbiddenRequestsException(
            'You do not have permission to update cards to this deck',
            ErrorCode.FORBIDDEN
        );
    }
    const updateCard = await Card.findByIdAndUpdate(cardId, {
        front,
        back,
        tags: tags || [],
        media: media || [],
        updatedAt: new Date()
    });
    await Deck.findByIdAndUpdate(deckId, {
        $set: { updatedAt: new Date() }
    });
    return updateCard;
};

export const getDeckCardsService = async (userId: string, deckId: string) => {
    const deck = await Deck.findById(deckId);
    if (!deck) {
        throw new NotFoundException('Deck not found', ErrorCode.NOT_FOUND);
    }

    const hasAccess = deck.owner.equals(userId) || deck.isPublic;

    if (!hasAccess) {
        throw new ForbiddenRequestsException('You do not have access to this deck', ErrorCode.FORBIDDEN);
    }

    const cards = await Card.find({ deck: deckId }).sort({ createdAt: -1 });

    const cardIds = cards.map((card) => card._id);

    const revlogs = await Revlog.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(userId),
                card: { $in: cardIds },
                deleted: false
            }
        },
        {
            $sort: { review: -1 }
        },
        {
            $group: {
                _id: '$card',
                latestRevlog: { $first: '$$ROOT' }
            }
        }
    ]);

    const progressMap = new Map();
    revlogs.forEach((item: any) => {
        progressMap.set(item._id.toString(), item.latestRevlog);
    });

    const cardsWithProgress = cards.map((card) => {
        const cardObj = card.toObject();
        const revlog = progressMap.get(card._id.toString());

        if (revlog) {
            return {
                ...cardObj,
                learning: {
                    state: revlog.state,
                    due: revlog.due,
                    elapsed_days: revlog.elapsed_days,
                    stability: revlog.stability,
                    difficulty: revlog.difficulty
                }
            };
        } else {
            return {
                ...cardObj,
                learning: {
                    state: 0,
                    due: new Date(),
                    elapsed_days: 0,
                    stability: 0,
                    difficulty: 0
                }
            };
        }
    });

    return {
        deckId,
        deckName: deck.name,
        cards: cardsWithProgress
    };
};

export const getCardDetailsService = async (userId: string, cardId: string) => {
    const card = await Card.findById(cardId).populate('deck', 'name description owner');
    if (!card) {
        throw new NotFoundException('Card not found', ErrorCode.NOT_FOUND);
    }

    // Check if user has access to this card
    const deck = card.deck as any;
    const hasAccess = deck.owner.equals(userId) || deck.isPublic;
    if (!hasAccess) {
        throw new ForbiddenRequestsException('You do not have access to this card', ErrorCode.FORBIDDEN);
    }

    // Get all review logs for this card by this user
    const revlogs = await Revlog.find({
        user: userId,
        card: cardId,
        deleted: false
    }).sort({ review: 1 }); // Sort chronologically

    // Get the latest review log for current learning state
    const latestRevlog = revlogs.length > 0 ? revlogs[revlogs.length - 1] : null;

    // Calculate metrics
    const totalReviews = revlogs.length;
    const averageRating = totalReviews > 0 ? revlogs.reduce((sum, log) => sum + log.grade, 0) / totalReviews : 0;

    // Count ratings
    const ratingCounts = {
        again: revlogs.filter((log) => log.grade === 1).length,
        hard: revlogs.filter((log) => log.grade === 2).length,
        good: revlogs.filter((log) => log.grade === 3).length,
        easy: revlogs.filter((log) => log.grade === 4).length
    };

    // Calculate success rate (ratings 2, 3, 4 are considered successful)
    const successRate =
        totalReviews > 0 ? (ratingCounts.hard + ratingCounts.good + ratingCounts.easy) / totalReviews : 0;

    // Current learning state
    const currentLearningState = latestRevlog
        ? {
              state: latestRevlog.state,
              due: latestRevlog.due,
              stability: latestRevlog.stability,
              difficulty: latestRevlog.difficulty,
              elapsed_days: latestRevlog.elapsed_days,
              scheduled_days: latestRevlog.scheduled_days
          }
        : {
              state: 0, // NEW
              due: new Date(),
              stability: 0,
              difficulty: 0,
              elapsed_days: 0,
              scheduled_days: 0
          };

    // Calculate retrievability if we have a stability value
    let retrievability = null;
    if (latestRevlog && latestRevlog.stability > 0) {
        const daysSinceReview = (new Date().getTime() - latestRevlog.review.getTime()) / (24 * 3600 * 1000);
        retrievability = Math.pow(1 + daysSinceReview / (9 * latestRevlog.stability), -1);
    }

    return {
        card: {
            _id: card._id,
            front: card.front,
            back: card.back,
            tags: card.tags,
            createdAt: card.createdAt,
            updatedAt: card.updatedAt,
            media: card.media,
            deck: {
                _id: deck._id,
                name: deck.name,
                description: deck.description
            }
        },
        learningState: currentLearningState,
        retrievability,
        revlogs: revlogs.map((log) => ({
            _id: log._id,
            grade: log.grade,
            state: log.state,
            due: log.due,
            stability: log.stability,
            difficulty: log.difficulty,
            elapsed_days: log.elapsed_days,
            last_elapsed_days: log.last_elapsed_days,
            scheduled_days: log.scheduled_days,
            review: log.review,
            duration: log.duration,
            created_at: log.created_at
        })),
        metrics: {
            totalReviews,
            averageRating: Math.round(averageRating * 100) / 100,
            successRate: Math.round(successRate * 100) / 100,
            ratingCounts
        }
    };
};

export const createCardService = async (userId: string, cardData: z.infer<typeof createCardValidation>) => {
    const { front, back, tags, deckId, media } = cardData;

    const deck = await Deck.findById(deckId);
    if (!deck) {
        throw new NotFoundException('Deck not found', ErrorCode.NOT_FOUND);
    }

    if (!deck.owner.equals(userId)) {
        throw new ForbiddenRequestsException(
            'You do not have permission to add cards to this deck',
            ErrorCode.FORBIDDEN
        );
    }

    const newCard = await Card.create({
        deck: deckId,
        front,
        back,
        tags: tags || [],
        media: media || [],
        createdAt: new Date(),
        updatedAt: new Date()
    });

    await Deck.findByIdAndUpdate(deckId, {
        $inc: { cardCount: 1 },
        $set: { updatedAt: new Date() }
    });

    await UserDeckState.updateMany(
        { deck: deckId },
        {
            $inc: {
                'stats.totalCards': 1,
                'stats.newCards': 1
            }
        }
    );

    return newCard;
};

export const batchCreateCardsService = async (
    userId: string,
    batchData: z.infer<typeof batchCreateCardsValidation>
) => {
    const { cards, deckId } = batchData;

    const deck = await Deck.findById(deckId);
    if (!deck) {
        throw new NotFoundException('Deck not found', ErrorCode.NOT_FOUND);
    }
    if (!deck.owner.equals(userId)) {
        throw new ForbiddenRequestsException(
            'You do not have permission to add cards to this deck',
            ErrorCode.FORBIDDEN
        );
    }

    const cardsToInsert = cards.map((card) => ({
        deck: deckId,
        front: card.front,
        back: card.back,
        tags: card.tags || [],
        media: card.media || [],
        createdAt: new Date(),
        updatedAt: new Date()
    }));

    const insertedCards = await Card.insertMany(cardsToInsert);

    await Deck.findByIdAndUpdate(deckId, {
        $inc: { cardCount: cards.length },
        $set: { updatedAt: new Date() }
    });

    await UserDeckState.updateMany(
        { deck: deckId },
        {
            $inc: {
                'stats.totalCards': cards.length,
                'stats.newCards': cards.length
            }
        }
    );

    return insertedCards;
};
export const deleteCardService = async (userId: string, cardId: string) => {
    const card = await Card.findById(cardId);
    if (!card) {
        throw new NotFoundException('Card not found', ErrorCode.NOT_FOUND);
    }
    const deck = await Deck.findById(card.deck);
    if (!deck) {
        throw new NotFoundException('Associated deck not found', ErrorCode.NOT_FOUND);
    }
    if (!deck.owner.equals(userId)) {
        throw new ForbiddenRequestsException(
            'You do not have permission to delete cards from this deck',
            ErrorCode.FORBIDDEN
        );
    }
    await Card.findByIdAndDelete(cardId);
    await Deck.findByIdAndUpdate(card.deck, {
        $inc: { cardCount: -1 },
        $set: { updatedAt: new Date() }
    });
    await Revlog.updateMany({ card: cardId }, { $set: { deleted: true } });
    await UserDeckState.updateMany(
        { deck: card.deck },
        {
            $inc: {
                'stats.totalCards': -1
            }
        }
    );
    return { success: true, message: 'Card deleted successfully' };
};
