import { Router } from 'express';
import {
    createCard,
    createMultipleCards,
    deleteCard,
    editCard,
    getCard,
    getCardById,
    getCardDetails
} from '~/controllers/cardController';
import { errorHandler } from '~/errorHandler';
import authMiddleware from '~/middlewares/authMiddleware';

const cardRoutes: Router = Router();

cardRoutes.post('/', [authMiddleware], errorHandler(createCard));
cardRoutes.post('/get-cards', [authMiddleware], errorHandler(getCard));
cardRoutes.post('/batch', [authMiddleware], errorHandler(createMultipleCards));
cardRoutes.put('/:id', [authMiddleware], errorHandler(editCard));
cardRoutes.delete('/:id', [authMiddleware], errorHandler(deleteCard));
cardRoutes.get('/:id', [authMiddleware], errorHandler(getCardById));
cardRoutes.get('/:id/details', [authMiddleware], errorHandler(getCardDetails));

export default cardRoutes;
