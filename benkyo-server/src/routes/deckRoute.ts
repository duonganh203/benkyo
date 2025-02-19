import { Router } from 'express';
import { createDeck } from '~/controllers/deckController';
import { errorHandler } from '~/errorHandler';
import authMiddleware from '~/middlewares/authMiddleware';

const deckRoutes: Router = Router();
deckRoutes.post('/', [authMiddleware], errorHandler(createDeck));
export default deckRoutes;
