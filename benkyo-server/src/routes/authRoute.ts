import { Router } from 'express';
import { addStory, getStory, login, me, register } from '~/controllers/authController';
import { errorHandler } from '~/errorHandler';
import authMiddleware from '~/middlewares/authMiddleware';

const authRoutes: Router = Router();

authRoutes.post('/login', errorHandler(login));
authRoutes.post('/register', errorHandler(register));
authRoutes.get('/me', [authMiddleware], errorHandler(me));
authRoutes.post('/add-story', errorHandler(addStory));
authRoutes.get('/story/:id', errorHandler(getStory));
export default authRoutes;
