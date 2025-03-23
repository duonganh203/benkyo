import { Router } from 'express';
import { getCards } from '~/controllers/cardController';
import { createDeck } from '~/controllers/deckController';
import { errorHandler } from '~/errorHandler';
import authMiddleware from '~/middlewares/authMiddleware';

const deckRoutes: Router = Router();

deckRoutes.post('/', [authMiddleware], errorHandler(createDeck));
deckRoutes.get('/:id/cards', [authMiddleware], errorHandler(getCards));

export default deckRoutes;
