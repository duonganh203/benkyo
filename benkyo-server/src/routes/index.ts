import { Router } from 'express';
import authRoutes from './authRoute';
import deckRoutes from './deckRoute';
import userRoutes from './userRoute';

const rootRouter: Router = Router();

rootRouter.use('/auth', authRoutes);
rootRouter.use('/deck', deckRoutes);
rootRouter.use('/user', userRoutes);
export default rootRouter;
