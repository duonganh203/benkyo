import { Router } from 'express';
import authRoutes from './authRoute';
import deckRoutes from './deckRoute';

const rootRouter: Router = Router();

rootRouter.use('/auth', authRoutes);
rootRouter.use('/deck', deckRoutes);
export default rootRouter;
