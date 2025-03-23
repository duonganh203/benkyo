import { Request, Response } from 'express';
import { batchCreateCardsService, createCardService, getCardsByIds, getDeckCardsService } from '~/services/cardService';
import { getDeckService } from '~/services/deckService';
import { batchCreateCardsValidation, createCardValidation } from '~/validations/cardValidation';

export const getCards = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const deckId = req.params.id;
    const cards = await getDeckCardsService(userId, deckId);
    res.json(cards);
};

export const getCard = async (req: Request, res: Response) => {
    const cardIds = req.body.cardIds;
    const cards = await getCardsByIds(cardIds);
    res.status(200).json(cards);
};

export const createCard = async (req: Request, res: Response) => {
    const cardData = req.body;
    const userId = req.user._id;
    createCardValidation.parse(cardData);
    const newCard = await createCardService(userId, cardData);
    res.json(newCard);
};

export const createMultipleCards = async (req: Request, res: Response) => {
    const batchData = req.body;
    const userId = req.user._id;

    batchCreateCardsValidation.parse(batchData);

    const insertedCards = await batchCreateCardsService(userId, batchData);

    res.json({
        message: `Successfully created ${insertedCards.length} cards`,
        cardsCreated: insertedCards.length,
        cards: insertedCards
    });
};

export const getDeck = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user._id;

    const result = await getDeckService(userId, id);

    res.json(result);
};
