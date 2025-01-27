import { Router } from 'express';
import { login, me, register } from '~/controllers/authController';
import { errorHandler } from '~/errorHandler';
import authMiddleware from '~/middlewares/authMiddleware';

const authRoutes: Router = Router();

authRoutes.post('/login', errorHandler(login));
authRoutes.post('/register', errorHandler(register));
authRoutes.get('/me', [authMiddleware], errorHandler(me));

export default authRoutes;
