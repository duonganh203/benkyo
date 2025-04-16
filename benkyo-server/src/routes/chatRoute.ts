import { Router } from 'express';
import { chatWithDocument, getAllConversations } from '~/controllers/chatController';
import { errorHandler } from '~/errorHandler';
import authMiddleware from '~/middlewares/authMiddleware';

const chatRoutes: Router = Router();

chatRoutes.get('/', [authMiddleware], errorHandler(getAllConversations));
chatRoutes.post('/', [authMiddleware], errorHandler(chatWithDocument));

export default chatRoutes;
