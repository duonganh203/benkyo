import { Router } from 'express';
import { triggerOptimization, getOptimizationStatus } from '~/controllers/optimizerController';
import { errorHandler } from '~/errorHandler';
import authMiddleware from '~/middlewares/authMiddleware';

const optimizerRoutes: Router = Router();

// Trigger manual optimization for a deck
optimizerRoutes.post('/:deckId/trigger', [authMiddleware], errorHandler(triggerOptimization));

// Get optimization status for a deck
optimizerRoutes.get('/:deckId/status', [authMiddleware], errorHandler(getOptimizationStatus));

export default optimizerRoutes;
