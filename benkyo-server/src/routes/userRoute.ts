import { Router } from 'express';
import { updateUser } from '~/controllers/userController';
import { errorHandler } from '~/errorHandler';
import authMiddleware from '~/middlewares/authMiddleware';

const userRoutes: Router = Router();
userRoutes.patch('/', [authMiddleware], errorHandler(updateUser));
export default userRoutes;
