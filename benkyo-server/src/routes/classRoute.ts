import { Router } from 'express';
import * as classController from '~/controllers/classController';
import authMiddleware from '~/middlewares/authMiddleware';
import { errorHandler } from '~/errorHandler';
import {
    createMoocDeckQuiz,
    deleteMoocDeckQuiz,
    getClassQuizzes,
    getQuizzesByDeck,
    submitClassQuizAttempt,
    updateMoocDeckQuiz
} from '~/controllers/quizController';

const classRoutes: Router = Router();

classRoutes.use(authMiddleware);

classRoutes.get('/:_id/member-progress', errorHandler(classController.getClassMemberProgress));
classRoutes.get('/:_id/member-learning-status', errorHandler(classController.getClassMemberLearningStatus));
classRoutes.get('/:_id/update-by-id', errorHandler(classController.getClassUpdateById));
classRoutes.get('/:_id/management', errorHandler(classController.getClassManagement));
classRoutes.get('/:_id/decks-to-add', errorHandler(classController.getDecksToAddToClass));
classRoutes.get('/:_id/user-detail', errorHandler(classController.getClassUserById));

classRoutes.get('/:_id/members', errorHandler(classController.getClassMembers));
classRoutes.get('/:_id/decks', errorHandler(classController.getClassDecks));
classRoutes.get('/:_id/invited', errorHandler(classController.getClassInvited));
classRoutes.get('/:_id/request-join', errorHandler(classController.getClassRequestJoin));
classRoutes.get('/:_id/visited', errorHandler(classController.getClassVisited));
classRoutes.get('/:_id/monthly-access-stats', errorHandler(classController.getClassMonthlyAccessStats));

classRoutes.get('/my-class', errorHandler(classController.getMyClassList));
classRoutes.get('/suggested', errorHandler(classController.getSuggestedClassList));
classRoutes.get('/notifications/all', errorHandler(classController.getAllNotifications));
classRoutes.get('/schedules/overdue', errorHandler(classController.getOverdueSchedules));
classRoutes.get('/schedules/upcoming', errorHandler(classController.getUpcomingDeadlines));
classRoutes.get('/invited', errorHandler(classController.getInviteClass));

classRoutes.post('/accept-invite', errorHandler(classController.acceptInviteClass));
classRoutes.post('/reject-invite', errorHandler(classController.rejectInviteClass));
classRoutes.post('/accept', errorHandler(classController.acceptJoinRequest));
classRoutes.post('/reject', errorHandler(classController.rejectJoinRequest));
classRoutes.post('/create', errorHandler(classController.classCreate));
classRoutes.post('/invite', errorHandler(classController.inviteMemberToClass));
classRoutes.post('/add-deck', errorHandler(classController.addDeckToClass));
classRoutes.post('/:classId/request', errorHandler(classController.classRequestJoin));

classRoutes.put('/:classId/update', errorHandler(classController.classUpdate));

classRoutes.delete('/:classId/delete', errorHandler(classController.classDelete));
classRoutes.delete('/remove-user', errorHandler(classController.removeUserFromClass));
classRoutes.delete('/remove-deck', errorHandler(classController.removeDeckFromClass));
classRoutes.delete('/cancel-invite', errorHandler(classController.cancelInvite));

classRoutes.post('/:classId/deck/:deckId/session/start', errorHandler(classController.startClassDeckSession));
classRoutes.post('/:classId/deck/:deckId/session/answer', errorHandler(classController.saveClassDeckAnswer));
classRoutes.post('/:classId/deck/:deckId/session/end', errorHandler(classController.endClassDeckSession));
classRoutes.get('/:classId/deck/:deckId/session/history', errorHandler(classController.getClassDeckSessionHistory));

classRoutes.get('/:classId/quiz', errorHandler(getClassQuizzes));
classRoutes.put('/:classId/mooc/:moocId/deck/:deckId/quiz/:quizId', [authMiddleware], errorHandler(updateMoocDeckQuiz));
classRoutes.delete('/:classId/quizzes/:quizId', [authMiddleware], errorHandler(deleteMoocDeckQuiz));
classRoutes.post('/:classId/quiz/mooc', [authMiddleware], errorHandler(createMoocDeckQuiz));

classRoutes.get('/:classId/mooc/:moocId/deck/:deckId/quizzes', [authMiddleware], errorHandler(getQuizzesByDeck));

classRoutes.post(
    '/:classId/mooc/:moocId/deck/:deckId/quizzes/:quizId/submit-attempt',
    [authMiddleware],
    errorHandler(submitClassQuizAttempt)
);
export default classRoutes;
