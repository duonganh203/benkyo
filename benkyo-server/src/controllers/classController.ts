import { Request, Response } from 'express';
import { classValidation } from '~/validations/classValidation';
import * as classService from '../services/classService';

export const classCreate = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const classRequest = classValidation.parse(req.body);

    const newClass = await classService.classCreateService(userId, classRequest);

    res.json(newClass);
};

export const classUpdate = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const classId = req.params.classId;
    const classRequest = classValidation.parse(req.body);

    const updatedClass = await classService.classUpdateService(classId, userId, classRequest);

    res.json(updatedClass);
};

export const getClassUpdateById = async (req: Request, res: Response) => {
    const classId = req.params.classId;
    const userId = req.user._id;

    const classData = await classService.getClassUpdateByIdService(classId, userId);

    res.json(classData);
};

export const classDelete = async (req: Request, res: Response) => {
    const classId = req.params.classId;
    const userId = req.user._id;

    const result = await classService.classDeleteService(classId, userId);

    res.json(result);
};

export const getMyClassList = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const search = req.query.search as string;

    const classData = await classService.getMyClassListService(userId, page, limit, search);

    res.json(classData);
};

export const getSuggestedClassList = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const search = req.query.search as string;

    const classData = await classService.getSuggestedListService(userId, page, limit, search);

    res.json(classData);
};

export const classRequestJoin = async (req: Request, res: Response) => {
    const { classId } = req.params;
    const userId = req.user._id;

    const result = await classService.classRequestJoinsService(classId, userId);

    res.json(result);
};

export const acceptJoinRequest = async (req: Request, res: Response) => {
    const classId = req.query.classId as string;
    const requestUserId = req.query.userId as string;
    const ownerId = req.user._id;

    const result = await classService.acceptJoinRequestService(classId, requestUserId, ownerId);

    res.json(result);
};

export const rejectJoinRequest = async (req: Request, res: Response) => {
    const classId = req.query.classId as string;
    const requestUserId = req.query.userId as string;
    const ownerId = req.user._id;

    const result = await classService.rejectJoinRequestService(classId, requestUserId, ownerId);

    res.json(result);
};

export const inviteMemberToClass = async (req: Request, res: Response) => {
    const classId = req.query.classId as string;
    const targetUserEmail = req.query.email as string;
    const ownerId = req.user._id;

    const result = await classService.inviteMemberToClassService(classId, ownerId, targetUserEmail);

    res.json(result);
};

export const acceptInviteClass = async (req: Request, res: Response) => {
    const classId = req.query.classId as string;
    const userId = req.user._id;

    const result = await classService.acceptInviteClassService(classId, userId);

    res.json(result);
};

export const rejectInviteClass = async (req: Request, res: Response) => {
    const classId = req.query.classId as string;
    const userId = req.user._id;

    const result = await classService.rejectInviteClassService(classId, userId);

    res.json(result);
};

export const getInviteClass = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const result = await classService.getInviteClassService(userId);

    res.json(result);
};

export const removeUserFromClass = async (req: Request, res: Response) => {
    const classId = req.query.classId as string;
    const userId = req.query.userId as string;
    const ownerId = req.user._id;

    const result = await classService.removeUserFromClassService(classId, userId, ownerId);

    res.json(result);
};

export const removeDeckFromClass = async (req: Request, res: Response) => {
    const classId = req.query.classId as string;
    const deckId = req.query.deckId as string;
    const ownerId = req.user._id;

    const result = await classService.removeDeckFromClassService(classId, deckId, ownerId);

    res.json(result);
};

export const addDeckToClass = async (req: Request, res: Response) => {
    const ownerId = req.user._id;
    const { classId, deckId, description, startTime, endTime } = req.body;

    const result = await classService.addDeckToClassService({
        classId,
        deckId,
        description,
        startTime,
        endTime,
        ownerId
    });

    res.json(result);
};

export const getDecksToAddToClass = async (req: Request, res: Response) => {
    const { _id } = req.params;

    const decks = await classService.getDecksToAddToClassService(_id);

    res.json(decks);
};

export const getClassUserById = async (req: Request, res: Response) => {
    const { _id } = req.params;
    const userId = req.user._id;
    const classItem = await classService.getClassUserByIdService(_id, userId);
    res.json(classItem);
};

export const startClassDeckSession = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { classId, deckId } = req.params;
    const { forceNew } = req.body || {};

    const result = await classService.startClassDeckSessionService(userId, classId, deckId, forceNew);

    return res.json(result);
};

export const saveClassDeckAnswer = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { classId, deckId } = req.params;
    const { sessionId, cardId, correct } = req.body;

    const result = await classService.saveClassDeckAnswerService(userId, classId, deckId, sessionId, cardId, correct);

    return res.json(result);
};

export const endClassDeckSession = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { classId, deckId } = req.params;
    const { sessionId, duration } = req.body;

    const result = await classService.endClassDeckSessionService(userId, classId, deckId, sessionId, duration);

    return res.json(result);
};

export const getClassDeckSessionHistory = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { classId, deckId } = req.params;

    const result = await classService.getClassDeckSessionHistoryService(userId, classId, deckId);

    return res.json(result);
};

export const getOverdueSchedules = async (req: Request, res: Response) => {
    const userId = req.user._id;

    const overdueSchedules = await classService.getOverdueSchedulesService(userId);

    res.json(overdueSchedules);
};

export const getUpcomingDeadlines = async (req: Request, res: Response) => {
    const userId = req.user._id;

    const upcomingDeadlines = await classService.getUpcomingDeadlinesService(userId);

    res.json(upcomingDeadlines);
};

export const getAllNotifications = async (req: Request, res: Response) => {
    const userId = req.user._id;

    const notifications = await classService.getAllNotificationsService(userId);

    res.json(notifications);
};

export const cancelInvite = async (req: Request, res: Response) => {
    const classId = req.query.classId as string;
    const userId = req.query.userId as string;
    const ownerId = req.user._id;

    const result = await classService.cancelInviteService(classId, userId, ownerId);

    res.json(result);
};

export const getClassMemberProgress = async (req: Request, res: Response) => {
    const classId = req.params._id;
    const userId = req.user._id;

    const progress = await classService.getClassMemberProgressService(classId, userId);

    res.json(progress);
};

export const getClassMemberLearningStatus = async (req: Request, res: Response) => {
    const classId = req.params._id;
    const userId = req.user._id;

    const memberStatus = await classService.getClassMemberLearningStatusService(classId, userId);

    res.json(memberStatus);
};

export const getClassMonthlyAccessStats = async (req: Request, res: Response) => {
    const classId = req.params._id;
    const userId = req.user._id;

    const monthlyStats = await classService.getClassMonthlyAccessStatsService(classId, userId);

    res.json(monthlyStats);
};

export const getClassManagement = async (req: Request, res: Response) => {
    const classId = req.params._id;
    const userId = req.user._id;

    const classData = await classService.getClassManagementService(classId, userId);

    res.json(classData);
};

export const getClassMembers = async (req: Request, res: Response) => {
    const classId = req.params._id;
    const userId = req.user._id;

    const members = await classService.getClassMembersService(classId, userId);

    res.json(members);
};

export const getClassDecks = async (req: Request, res: Response) => {
    const classId = req.params._id;
    const userId = req.user._id;

    const decks = await classService.getClassDecksService(classId, userId);

    res.json(decks);
};

export const getClassInvited = async (req: Request, res: Response) => {
    const classId = req.params._id;
    const userId = req.user._id;

    const invited = await classService.getClassInvitedService(classId, userId);

    res.json(invited);
};

export const getClassRequestJoin = async (req: Request, res: Response) => {
    const classId = req.params._id;
    const userId = req.user._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const requests = await classService.getClassRequestJoinService(classId, userId, page, limit);

    res.json(requests);
};

export const getClassVisited = async (req: Request, res: Response) => {
    const classId = req.params._id;
    const userId = req.user._id;

    const visited = await classService.getClassVisitedService(classId, userId);

    res.json(visited);
};
