import { Router } from 'express';
import { chatWithDocument } from '~/controllers/chatController';
import { errorHandler } from '~/errorHandler';
import authMiddleware from '~/middlewares/authMiddleware';

const chatRoutes: Router = Router();

chatRoutes.post('/', [authMiddleware], errorHandler(chatWithDocument));

export default chatRoutes;
