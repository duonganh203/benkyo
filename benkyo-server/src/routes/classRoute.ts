import { Router } from 'express';
import * as classController from '~/controllers/classController';
import authMiddleware from '~/middlewares/authMiddleware';
import { errorHandler } from '~/errorHandler';

const classRoutes: Router = Router();

classRoutes.use(authMiddleware);

classRoutes.get('/list', errorHandler(classController.getClassListUser));
classRoutes.get('/my-class', errorHandler(classController.getMyClassList));
classRoutes.get('/suggested', errorHandler(classController.getSuggestedClassList));
classRoutes.get('/:_id/update-by-id', errorHandler(classController.getClassUpdateById));

classRoutes.post('/create', errorHandler(classController.createClass));
classRoutes.post('/:_id/request', errorHandler(classController.requestJoinClass));

classRoutes.put('/:_id/update', errorHandler(classController.updateClass));

classRoutes.delete('/:_id/delete', errorHandler(classController.deleteClass));

export default classRoutes;
