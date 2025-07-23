import { Router } from 'express';
import { updateUserProfile, listUserAccounts, getAccountStats } from '~/controllers/userController';

import { errorHandler } from '~/errorHandler';
import authMiddleware from '~/middlewares/authMiddleware';
import adminAuthMiddleware from '~/middlewares/adminAuthMiddleware';
const userRoutes: Router = Router();

userRoutes.patch('/update', [authMiddleware], errorHandler(updateUserProfile));
userRoutes.get('/listAccounts', [adminAuthMiddleware], errorHandler(listUserAccounts));
userRoutes.get('/accountStats', [adminAuthMiddleware], errorHandler(getAccountStats));
export default userRoutes;
