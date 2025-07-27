import { Request, Response } from 'express';
import {
    batchCreateCardsService,
    createCardService,
    deleteCardService,
    getCardByIdService,
    getCardsByIds,
    getCardDetailsService,
    getDeckCardsService,
    updateCard
} from '~/services/cardService';
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

export const getCardById = async (req: Request, res: Response) => {
    const cardId = req.params.id;
    const card = await getCardByIdService(cardId);
    res.json(card);
};

export const createCard = async (req: Request, res: Response) => {
    const cardData = req.body;
    const userId = req.user._id;
    createCardValidation.parse(cardData);
    const newCard = await createCardService(userId, cardData);
    res.json(newCard);
};

export const editCard = async (req: Request, res: Response) => {
    const cardId = req.params.id;
    const userId = req.user._id;
    const cardData = req.body;
    createCardValidation.parse(cardData);
    const updatedCard = await updateCard(cardId, userId, cardData);
    res.json(updatedCard);
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

export const deleteCard = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const cardId = req.params.id;
    const result = await deleteCardService(userId, cardId);
    res.json(result);
};

export const getCardDetails = async (req: Request, res: Response) => {
    const cardId = req.params.id;
    const userId = req.user._id;
    const cardDetails = await getCardDetailsService(userId, cardId);
    res.json({ success: true, data: cardDetails });
};
