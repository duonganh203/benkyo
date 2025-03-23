import mongoose from 'mongoose';
import z from 'zod';
import { NotFoundException } from '~/exceptions/notFound';
import { ErrorCode } from '~/exceptions/root';
import { UnauthorizedException } from '~/exceptions/unauthorized';
import { Card, Deck, Revlog, UserDeckState } from '~/schemas';
import { batchCreateCardsValidation, createCardValidation } from '~/validations/cardValidation';

export const getCardsByIds = async (cardIds: string[]) => {
    const cards = await Card.find({ _id: { $in: cardIds } });
    return cards;
};

export const getDeckCardsService = async (userId: string, deckId: string) => {
    const deck = await Deck.findById(deckId);
    if (!deck) {
        throw new NotFoundException('Deck not found', ErrorCode.NOT_FOUND);
    }

    const hasAccess =
        deck.owner.equals(userId) || (deck.isPublic && deck.subscribers.some((sub) => sub.equals(userId)));

    if (!hasAccess) {
        throw new UnauthorizedException('You do not have access to this deck', ErrorCode.UNAUTHORIZED);
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

export const createCardService = async (userId: string, cardData: z.infer<typeof createCardValidation>) => {
    const { front, back, tags, deckId, media } = cardData;

    const deck = await Deck.findById(deckId);
    if (!deck) {
        throw new NotFoundException('Deck not found', ErrorCode.NOT_FOUND);
    }

    if (!deck.owner.equals(userId)) {
        throw new UnauthorizedException('You do not have permission to add cards to this deck', ErrorCode.UNAUTHORIZED);
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
        throw new UnauthorizedException('You do not have permission to add cards to this deck', ErrorCode.UNAUTHORIZED);
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
