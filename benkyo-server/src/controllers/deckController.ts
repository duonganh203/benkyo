import { Request, Response } from 'express';
import { createDeckService } from '~/services/deckService';
import { createDeckValidation } from '~/validations/deckValidation';

export const createDeck = async (req: Request, res: Response) => {
    const deckData = req.body;
    createDeckValidation.parse(deckData);
    const deck = await createDeckService(req.user.id, deckData);
    res.json(deck);
};
