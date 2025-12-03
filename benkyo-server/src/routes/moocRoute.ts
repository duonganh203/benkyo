import { Router } from 'express';
import {
    createMooc,
    getAllMoocs,
    getMoocById,
    updateMooc,
    deleteMooc,
    enrollUser,
    updateProgress,
    updateDeckProgressForUser,
    purchaseMoocController
} from '~/controllers/moocController';
import { errorHandler } from '~/errorHandler';
import authMiddleware from '~/middlewares/authMiddleware';

const moocRoutes: Router = Router();

moocRoutes.post('/:classId/createMooc', [authMiddleware], errorHandler(createMooc));
moocRoutes.get('/class/:classId', [authMiddleware], errorHandler(getAllMoocs));
moocRoutes.get('/:id', [authMiddleware], errorHandler(getMoocById));
moocRoutes.put('/:id', [authMiddleware], errorHandler(updateMooc));
moocRoutes.delete('/:id', [authMiddleware], errorHandler(deleteMooc));
moocRoutes.post('/:id/enroll', [authMiddleware], errorHandler(enrollUser));
moocRoutes.put('/:id/progress', [authMiddleware], errorHandler(updateProgress));

moocRoutes.patch('/:moocId/decks/:deckId/progress', [authMiddleware], errorHandler(updateDeckProgressForUser));

moocRoutes.post('/:moocId/purchase', [authMiddleware], errorHandler(purchaseMoocController));

export default moocRoutes;
