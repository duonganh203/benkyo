import { Request, Response } from 'express';
import { PublicStatus } from '~/schemas';
import {
    createDeckService,
    deleteDeckService,
    getAllDecksService,
    getAllRequestedPublicDecksService,
    getDeckService,
    sendReqPublicDeckService,
    getPublicDecksService,
    getRequestPulbicDeckService,
    reviewPublicDeckService,
    subscribeToDeckService
} from '~/services/deckService';
import { createDeckValidation } from '~/validations/deckValidation';

export const createDeck = async (req: Request, res: Response) => {
    const deckData = req.body;
    createDeckValidation.parse(deckData);
    const deckId = await createDeckService(req.user.id, deckData);
    res.json(deckId);
};
export const getAllDecks = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const result = await getAllDecksService(userId);
    res.json(result);
};

export const getDeck = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user._id;

    const result = await getDeckService(userId, id);

    res.json(result);
};

export const deleteDeck = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user._id;
    const result = await deleteDeckService(userId, id);
    return res.json({ message: result.message });
};

export const sendReqPublicDeck = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user._id;
    const result = await sendReqPublicDeckService(userId, id);
    return res.json({ message: result.message });
};

export const getPublicDecks = async (req: Request, res: Response) => {
    const result = await getPublicDecksService();
    res.json(result);
};

export const getAllRequestPublicDecks = async (req: Request, res: Response) => {
    const result = await getAllRequestedPublicDecksService();
    res.json(result);
};

export const getRequestPulbicDeck = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await getRequestPulbicDeckService(id);
    if (!result) {
        return res.status(404).json({ message: 'Deck not found' });
    }
    return res.json(result);
};

export const reviewPublicServiceDeck = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!Object.values(PublicStatus).includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
    }

    const result = await reviewPublicDeckService(id, status, req.user._id, note);
    return res.json({ message: result.message });
};

export const subscribeToDeck = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user._id;

    const result = await subscribeToDeckService(userId, id);
    return res.json(result);
};
