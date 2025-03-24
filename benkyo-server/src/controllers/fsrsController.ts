import { Request, Response } from 'express';
import {
    processReview,
    getDueCards,
    updateFSRSParams,
    getUserFSRSParams,
    getUserProgressService,
    skipCardService
} from '~/services/fsrsService';
import { Rating } from '~/schemas';

export const reviewCard = async (req: Request, res: Response) => {
    const { cardId, rating, reviewTime } = req.body;
    const userId = req.user._id;

    if (!cardId || !rating) {
        return res.status(400).json({ error: 'Card ID and rating are required' });
    }

    if (!Object.values(Rating).includes(rating)) {
        return res.status(400).json({ error: 'Invalid rating' });
    }

    const result = await processReview(userId, cardId, rating, reviewTime || 0);

    res.json(result);
};

export const getDueCardsForDeck = async (req: Request, res: Response) => {
    const { deckId } = req.params;
    const userId = req.user._id;

    const dueCardIds = await getDueCards(userId, deckId);

    res.json({ dueCardIds });
};

export const skipCard = async (req: Request, res: Response) => {
    const { cardId } = req.body;
    const userId = req.user._id;
    if (!cardId) {
        return res.json({ error: 'Card ID is required' });
    }
    const result = await skipCardService(userId, cardId);
    res.json(result);
};

export const updateUserFSRSParams = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const params = req.body;

    const updatedParams = await updateFSRSParams(userId, params);

    res.json(updatedParams);
};

export const getFSRSParams = async (req: Request, res: Response) => {
    const userId = req.user._id;

    const params = await getUserFSRSParams(userId);

    res.json(params);
};

export const getUserProgress = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const progress = await getUserProgressService(userId);
    res.json(progress);
};
