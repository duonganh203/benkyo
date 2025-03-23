import { Request, Response } from 'express';
import { createDeckService, getAllDecksService } from '~/services/deckService';
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
