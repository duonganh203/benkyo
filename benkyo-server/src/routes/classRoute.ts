import { Router } from 'express';
import * as classController from '~/controllers/classController';
import authMiddleware from '~/middlewares/authMiddleware';
import { errorHandler } from '~/errorHandler';

const classRoutes: Router = Router();

classRoutes.use(authMiddleware);

classRoutes.post('/create', errorHandler(classController.createClass));

export default classRoutes;
