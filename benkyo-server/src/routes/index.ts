import { Router } from 'express';
import authRoutes from './authRoute';
import deckRoutes from './deckRoute';
import cardRoutes from './cardRoute';
import fsrsRoutes from './fsrsRoute';
import userRoutes from './userRoute';
import quizRoutes from './quizRoute';
import documentRoutes from './documentRoute';
import chatRoutes from './chatRoute';

const rootRouter: Router = Router();

rootRouter.use('/auth', authRoutes);
rootRouter.use('/deck', deckRoutes);
rootRouter.use('/decks', deckRoutes);
rootRouter.use('/cards', cardRoutes);
rootRouter.use('/fsrs', fsrsRoutes);
rootRouter.use('/user', userRoutes);
rootRouter.use('/quiz', quizRoutes);
rootRouter.use('/documents', documentRoutes);
rootRouter.use('/chat', chatRoutes);

export default rootRouter;
