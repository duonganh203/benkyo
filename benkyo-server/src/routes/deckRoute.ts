import { Router } from 'express';
import { getCards } from '~/controllers/cardController';
import {
    createDeck,
    deleteDeck,
    getAllDecks,
    getAllRequestPublicDecks,
    getDeck,
    getPublicDecks,
    getRequestPulbicDeck,
    reviewPublicServiceDeck,
    sendReqPublicDeck,
    subscribeToDeck
} from '~/controllers/deckController';
import { errorHandler } from '~/errorHandler';
import adminAuthMiddleware from '~/middlewares/adminAuthMiddleware';
import authMiddleware from '~/middlewares/authMiddleware';

const deckRoutes: Router = Router();

deckRoutes.post('/', [authMiddleware], errorHandler(createDeck));
deckRoutes.get('/public-requests', [adminAuthMiddleware], errorHandler(getAllRequestPublicDecks));
deckRoutes.get('/public-requests/:id', [adminAuthMiddleware], errorHandler(getRequestPulbicDeck));
deckRoutes.patch('/public-requests/:id', [adminAuthMiddleware], errorHandler(reviewPublicServiceDeck));
deckRoutes.get('/my-decks', [authMiddleware], errorHandler(getAllDecks));
deckRoutes.get('/public-deck', [authMiddleware], errorHandler(getPublicDecks));
deckRoutes.get('/:id', [authMiddleware], errorHandler(getDeck));
deckRoutes.get('/:id/cards', [authMiddleware], errorHandler(getCards));
deckRoutes.delete('/:id', [authMiddleware], errorHandler(deleteDeck));
deckRoutes.patch('/:id/request-public', [authMiddleware], errorHandler(sendReqPublicDeck));
deckRoutes.post('/:id/subscribe', [authMiddleware], errorHandler(subscribeToDeck));

export default deckRoutes;
