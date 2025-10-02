import { Router } from 'express';
import { getRemainingCredit } from '~/controllers/limitController';
import { errorHandler } from '~/errorHandler';
import authMiddleware from '~/middlewares/authMiddleware';

const limitRoutes: Router = Router();

limitRoutes.get('/:function', [authMiddleware], errorHandler(getRemainingCredit));

export default limitRoutes;
