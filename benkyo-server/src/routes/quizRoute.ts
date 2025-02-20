import { Router } from 'express';
import {
    addManyQuestions,
    addQuestion,
    delQuiz,
    doQuiz,
    findQuiz,
    getQuizes,
    showResult,
    takeQuiz,
    updateQuiz
} from '~/controllers/quizController';
import { errorHandler } from '~/errorHandler';
import authMiddleware from '~/middlewares/authMiddleware';

const quizRoutes: Router = Router();
quizRoutes.get('/', errorHandler(getQuizes));
quizRoutes.get('/:id/populate', errorHandler(findQuiz));
quizRoutes.post('/:id', errorHandler(updateQuiz));
quizRoutes.delete('/:id', errorHandler(delQuiz));
quizRoutes.post('/:id/question', errorHandler(addQuestion));
quizRoutes.post('/:id/questions', errorHandler(addManyQuestions));
quizRoutes.post('/:id/test', [authMiddleware], errorHandler(doQuiz));
quizRoutes.get('/:id/take', [authMiddleware], errorHandler(takeQuiz));
quizRoutes.get('/result/:id', [authMiddleware], errorHandler(showResult));
export default quizRoutes;
