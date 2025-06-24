import { Router } from 'express';
import { getLoginStreakController, updateLoginStreakController } from '~/controllers/streakController';
import { errorHandler } from '~/errorHandler';
import authMiddleware from '~/middlewares/authMiddleware';

const streakRoutes: Router = Router();

streakRoutes.get('/', [authMiddleware], errorHandler(getLoginStreakController));
streakRoutes.post('/', [authMiddleware], errorHandler(updateLoginStreakController));

export default streakRoutes;
