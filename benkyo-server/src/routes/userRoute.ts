import { Router } from 'express';
import { updateUserProfile } from '~/controllers/userController';

import { errorHandler } from '~/errorHandler';
import authMiddleware from '~/middlewares/authMiddleware';

const userRoutes: Router = Router();

userRoutes.patch('/update', [authMiddleware], errorHandler(updateUserProfile));

export default userRoutes;
