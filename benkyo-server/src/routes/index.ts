import { Router } from 'express';
import authRoutes from './authRoute';
import deckRoutes from './deckRoute';
import cardRoutes from './cardRoute';
import fsrsRoutes from './fsrsRoute';

const rootRouter: Router = Router();

rootRouter.use('/auth', authRoutes);
rootRouter.use('/deck', deckRoutes);
rootRouter.use('/decks', deckRoutes);
rootRouter.use('/cards', cardRoutes);
rootRouter.use('/fsrs', fsrsRoutes);

export default rootRouter;
