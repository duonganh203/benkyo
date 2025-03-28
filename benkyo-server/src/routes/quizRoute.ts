import { Router } from 'express';
import {
    createQuiz,
    getAllQuizAttempts,
    getQuizAttemptsById,
    getQuizById,
    saveQuizAttempt
} from '~/controllers/quizController';
import { errorHandler } from '~/errorHandler';
import authMiddleware from '~/middlewares/authMiddleware';

const quizRoutes: Router = Router();

quizRoutes.post('/', [authMiddleware], errorHandler(createQuiz));
quizRoutes.get('/attempts', [authMiddleware], errorHandler(getAllQuizAttempts));
quizRoutes.get('/:quizId', [authMiddleware], errorHandler(getQuizById));
quizRoutes.post('/:quizId/attempt', [authMiddleware], errorHandler(saveQuizAttempt));
quizRoutes.get('/attempt/:quizAttemptId', [authMiddleware], errorHandler(getQuizAttemptsById));

export default quizRoutes;
