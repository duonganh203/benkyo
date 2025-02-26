import { Router } from 'express';
import quizRoutes from './quiz';
import authRoutes from './auth';

const rootRouter: Router = Router();

rootRouter.use('/auth', authRoutes);
rootRouter.use('/quiz', quizRoutes);

export default rootRouter;
