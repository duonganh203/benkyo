import { Router } from 'express';
import {
    facebookCallback,
    facebookLogin,
    googleCallback,
    googleLogin,
    login,
    me,
    refreshToken,
    register,
    changePassword
} from '~/controllers/authController';
import { errorHandler } from '~/errorHandler';
import authMiddleware from '~/middlewares/authMiddleware';

const authRoutes: Router = Router();

authRoutes.post('/login', errorHandler(login));
authRoutes.post('/register', errorHandler(register));
authRoutes.post('/refresh-token', errorHandler(refreshToken));
authRoutes.get('/me', [authMiddleware], errorHandler(me));
authRoutes.get('/google', errorHandler(googleLogin));
authRoutes.get('/google/callback', errorHandler(googleCallback));
authRoutes.get('/facebook', errorHandler(facebookLogin));
authRoutes.get('/facebook/callback', errorHandler(facebookCallback));
authRoutes.post('/changePassword', [authMiddleware], errorHandler(changePassword));
export default authRoutes;
