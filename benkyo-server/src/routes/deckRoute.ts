import { Router } from 'express';
import { getCards } from '~/controllers/cardController';
import {
    createDeck,
    deleteDeck,
    getAllDecks,
    getDeck,
    sendReqPublicDeck,
    getPublicDecks
} from '~/controllers/deckController';
import { errorHandler } from '~/errorHandler';
import authMiddleware from '~/middlewares/authMiddleware';

const deckRoutes: Router = Router();

deckRoutes.post('/', [authMiddleware], errorHandler(createDeck));
deckRoutes.get('/my-decks', [authMiddleware], errorHandler(getAllDecks));
deckRoutes.get('/public-deck', errorHandler(getPublicDecks));
deckRoutes.get('/:id', [authMiddleware], errorHandler(getDeck));
deckRoutes.get('/:id/cards', [authMiddleware], errorHandler(getCards));
deckRoutes.delete('/:id', [authMiddleware], errorHandler(deleteDeck));
deckRoutes.patch('/:id/request-public', [authMiddleware], errorHandler(sendReqPublicDeck));

export default deckRoutes;
