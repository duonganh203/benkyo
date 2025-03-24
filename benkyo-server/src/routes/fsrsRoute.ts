import { Router } from 'express';
import {
    reviewCard,
    getDueCardsForDeck,
    updateUserFSRSParams,
    getFSRSParams,
    getUserProgress
} from '~/controllers/fsrsController';
import { errorHandler } from '~/errorHandler';
import authMiddleware from '~/middlewares/authMiddleware';

const fsrsRoutes: Router = Router();

fsrsRoutes.post('/review', [authMiddleware], errorHandler(reviewCard));
fsrsRoutes.get('/due-cards/:deckId', [authMiddleware], errorHandler(getDueCardsForDeck));
fsrsRoutes.put('/params', [authMiddleware], errorHandler(updateUserFSRSParams));
fsrsRoutes.get('/params', [authMiddleware], errorHandler(getFSRSParams));
fsrsRoutes.get('/progress', [authMiddleware], errorHandler(getUserProgress));

export default fsrsRoutes;
