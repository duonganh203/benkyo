import { Router } from 'express';
import * as classController from '~/controllers/classController';
import authMiddleware from '~/middlewares/authMiddleware';
import { errorHandler } from '~/errorHandler';

const classRoutes: Router = Router();

classRoutes.use(authMiddleware);

classRoutes.get('/list', errorHandler(classController.getClassListUser));
classRoutes.get('/my-class', errorHandler(classController.getMyClassList));
classRoutes.get('/suggested', errorHandler(classController.getSuggestedClassList));
classRoutes.get('/invited', errorHandler(classController.getInviteClass));
classRoutes.get('/:_id/update-by-id', errorHandler(classController.getClassUpdateById));
classRoutes.get('/:_id/management', errorHandler(classController.getClassManagementById));
classRoutes.get('/:_id/decks-to-add', classController.getDecksToAddToClass);
classRoutes.get('/:_id/user-detail', errorHandler(classController.getClassUserById));

classRoutes.post('/accept-invite', errorHandler(classController.acceptInviteClass));
classRoutes.post('/reject-invite', errorHandler(classController.rejectInviteClass));
classRoutes.post('/accept', errorHandler(classController.acceptJoinRequest));
classRoutes.post('/reject', errorHandler(classController.rejectJoinRequest));
classRoutes.post('/create', errorHandler(classController.createClass));
classRoutes.post('/invite', errorHandler(classController.inviteMemberToClass));
classRoutes.post('/add-deck', errorHandler(classController.addDeckToClass));
classRoutes.post('/:_id/request', errorHandler(classController.requestJoinClass));

classRoutes.put('/:_id/update', errorHandler(classController.updateClass));

classRoutes.delete('/:_id/delete', errorHandler(classController.deleteClass));
classRoutes.delete('/remove-user', errorHandler(classController.removeUserFromClass));
classRoutes.delete('/remove-deck', errorHandler(classController.removeDeckFromClass));

export default classRoutes;
