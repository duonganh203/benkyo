import { Router } from 'express';
import { getRemainingCredits } from '~/controllers/litmitController';
import { errorHandler } from '~/errorHandler';
import authMiddleware from '~/middlewares/authMiddleware';

const litmitRoutes: Router = Router();

litmitRoutes.get('/', [authMiddleware], errorHandler(getRemainingCredits));

export default litmitRoutes;
