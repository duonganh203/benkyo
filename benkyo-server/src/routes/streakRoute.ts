import { Router } from 'express';
import {
    getStudyStreakController,
    getTopLongestStudyStreakController,
    updateStudyStreakController
} from '~/controllers/streakController';
import { errorHandler } from '~/errorHandler';
import authMiddleware from '~/middlewares/authMiddleware';

const streakRoutes: Router = Router();

streakRoutes.get('/study', [authMiddleware], errorHandler(getStudyStreakController));
streakRoutes.post('/study', [authMiddleware], errorHandler(updateStudyStreakController));
streakRoutes.get('/study/top', errorHandler(getTopLongestStudyStreakController));

export default streakRoutes;
