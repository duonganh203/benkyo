import { Router } from 'express';
import authRoutes from './authRoute';
import quizRoutes from './quizRoute';

const rootRouter: Router = Router();

rootRouter.use('/auth', authRoutes);
rootRouter.use('/quizzes', quizRoutes);

export default rootRouter;
