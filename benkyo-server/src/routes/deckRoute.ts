import { Router } from 'express';
import { getCards } from '~/controllers/cardController';
import {
    createDeck,
    deleteDeck,
    duplicateDeck,
    getAllDecks,
    getAllRequestPublicDecks,
    getDeck,
    getPublicDecks,
    getRequestPulbicDeck,
    reviewPublicServiceDeck,
    sendReqPublicDeck,
    updateDeckFsrsParams,
    getDeckStats,
    toggleLikeDeck
} from '~/controllers/deckController';
import { errorHandler } from '~/errorHandler';
import adminAuthMiddleware from '~/middlewares/adminAuthMiddleware';
import authMiddleware from '~/middlewares/authMiddleware';

const deckRoutes: Router = Router();

deckRoutes.post('/', [authMiddleware], errorHandler(createDeck));
deckRoutes.get('/public-requests', [adminAuthMiddleware], errorHandler(getAllRequestPublicDecks));
deckRoutes.get('/deckStats', [adminAuthMiddleware], errorHandler(getDeckStats));
deckRoutes.get('/public-requests/:id', [adminAuthMiddleware], errorHandler(getRequestPulbicDeck));
deckRoutes.patch('/public-requests/:id', [adminAuthMiddleware], errorHandler(reviewPublicServiceDeck));
deckRoutes.get('/my-decks', [authMiddleware], errorHandler(getAllDecks));
deckRoutes.get('/public-deck', [authMiddleware], errorHandler(getPublicDecks));
deckRoutes.get('/:id', [authMiddleware], errorHandler(getDeck));
deckRoutes.post('/:id/duplicate', [authMiddleware], errorHandler(duplicateDeck));
deckRoutes.get('/:id/cards', [authMiddleware], errorHandler(getCards));
deckRoutes.delete('/:id', [authMiddleware], errorHandler(deleteDeck));
deckRoutes.patch('/:id/request-public', [authMiddleware], errorHandler(sendReqPublicDeck));
deckRoutes.patch('/:id/fsrs', [authMiddleware], errorHandler(updateDeckFsrsParams));
deckRoutes.post('/:id/like', [authMiddleware], errorHandler(toggleLikeDeck));
export default deckRoutes;
