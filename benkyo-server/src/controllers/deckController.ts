import { Request, Response } from 'express';
import { createDeckService, deleteDeckService, getAllDecksService, getDeckService } from '~/services/deckService';
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
