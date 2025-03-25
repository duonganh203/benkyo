import { Router } from 'express';
import { createQuiz } from '~/controllers/quizController';
import { errorHandler } from '~/errorHandler';
import authMiddleware from '~/middlewares/authMiddleware';

const quizRoutes: Router = Router();
quizRoutes.post('/', [authMiddleware], errorHandler(createQuiz));

export default quizRoutes;
