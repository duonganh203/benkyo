import { Router } from 'express';
import { createCard, createMultipleCards, getCard } from '~/controllers/cardController';
import { errorHandler } from '~/errorHandler';
import authMiddleware from '~/middlewares/authMiddleware';

const cardRoutes: Router = Router();

cardRoutes.post('/', [authMiddleware], errorHandler(createCard));
cardRoutes.post('/get-cards', [authMiddleware], errorHandler(getCard));
cardRoutes.post('/batch', [authMiddleware], errorHandler(createMultipleCards));

export default cardRoutes;
