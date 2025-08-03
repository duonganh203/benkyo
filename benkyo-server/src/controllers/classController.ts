import { Request, Response, NextFunction } from 'express';
import { classValidation } from '~/validations/classValidation';
import * as classService from '../services/classService';

export const classCreate = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const classRequest = classValidation.parse(req.body);

    const newClass = await classService.classCreateService(userId, classRequest);

    res.json(newClass);
};

export const updateClass = async (req: Request, res: Response) => {
    try {
        const classId = req.params._id;
        const classData = classValidation.parse(req.body);
        const userId = req.user._id;

        const updatedClass = await classService.updateClassService(classId, userId, classData);

        res.status(200).json(updatedClass);
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        return res.status(400).json({ message: 'Failed to update class', error: errMsg });
    }
};

export const classDelete = async (req: Request, res: Response) => {
    const classId = req.params.classId;
    const userId = req.user._id;

    const result = await classService.classDeleteService(classId, userId);

    res.json(result);
};

export const getClassUpdateById = async (req: Request, res: Response) => {
    try {
        const classId = req.params._id;
        const userId = req.user._id;

        const classData = await classService.getClassUpdateByIdService(classId, userId);

        res.status(200).json(classData);
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        return res.status(400).json({ message: 'Failed to get class', error: errMsg });
    }
};

export const getMyClassList = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const search = req.query.search as string;

    const classData = await classService.getMyClassListService(userId, page, limit, search);

    res.json(classData);
};

export const getClassManagementById = async (req: Request, res: Response) => {
    try {
        const classId = req.params._id;
        const userId = req.user._id;
        const classData = await classService.getClassManagementByIdService(classId, userId);

        res.status(200).json(classData);
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        return res.status(400).json({ message: 'Failed to get class', error: errMsg });
    }
};

export const getSuggestedClassList = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const search = req.query.search as string;

    const classData = await classService.getSuggestedListService(userId, page, limit, search);

    res.json(classData);
};

export const requestJoinClass = async (req: Request, res: Response) => {
    try {
        const { _id } = req.params;
        const userId = req.user._id;
        const result = await classService.requestJoinClasssService(_id, userId);
        res.status(200).json(result);
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        return res.status(400).json({ message: 'Failed request join class', error: errMsg });
    }
};

export const acceptJoinRequest = async (req: Request, res: Response) => {
    try {
        const classId = req.query.classId as string;
        const requestUserId = req.query.userId as string;
        const ownerId = req.user._id;

        const result = await classService.acceptJoinRequestService(classId, requestUserId, ownerId);

        res.status(200).json(result);
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        return res.status(400).json({ message: 'Failed to accept join request', error: errMsg });
    }
};

export const rejectJoinRequest = async (req: Request, res: Response) => {
    try {
        const classId = req.query.classId as string;
        const requestUserId = req.query.userId as string;
        const ownerId = req.user._id;
        const result = await classService.rejectJoinRequestService(classId, requestUserId, ownerId);

        res.status(200).json(result);
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        return res.status(400).json({ message: 'Failed to reject join request', error: errMsg });
    }
};

export const inviteMemberToClass = async (req: Request, res: Response) => {
    try {
        const classId = req.query.classId as string;
        const targetUserEmail = req.query.email as string;
        const ownerId = req.user._id;

        const result = await classService.inviteMemberToClassService(classId, ownerId, targetUserEmail);
        res.status(200).json(result);
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        return res.status(400).json({ message: 'Failed to invite member', error: errMsg });
    }
};

export const acceptInviteClass = async (req: Request, res: Response) => {
    try {
        const classId = req.query.classId as string;
        const userId = req.user._id;
        if (!classId) {
            return res.status(400).json({ message: 'Missing classId or userId' });
        }

        const result = await classService.acceptInviteClassService(classId, userId);
        res.status(200).json(result);
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        return res.status(400).json({ message: 'Failed to accept class invitation', error: errMsg });
    }
};

export const rejectInviteClass = async (req: Request, res: Response) => {
    try {
        const classId = req.query.classId as string;
        const userId = req.user._id;

        if (!classId) {
            return res.status(400).json({ message: 'Missing classId or userId' });
        }

        const result = await classService.rejectInviteClassService(classId, userId);
        res.status(200).json(result);
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        return res.status(400).json({ message: 'Failed to reject class invitation', error: errMsg });
    }
};

export const getInviteClass = async (req: Request, res: Response) => {
    try {
        const userId = req.user._id;
        const result = await classService.getInviteClassService(userId);
        res.status(200).json(result);
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        return res.status(400).json({ message: 'Failed to get invite class list', error: errMsg });
    }
};

export const removeUserFromClass = async (req: Request, res: Response) => {
    try {
        const classId = req.query.classId as string;
        const userId = req.query.userId as string;
        const ownerId = req.user._id;

        if (!classId || !userId) {
            return res.status(400).json({ message: 'Missing classId or userId' });
        }

        const result = await classService.removeUserFromClassService(classId, userId, ownerId);
        res.status(200).json(result);
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        return res.status(400).json({ message: 'Failed to remove user from class', error: errMsg });
    }
};

export const removeDeckFromClass = async (req: Request, res: Response) => {
    try {
        const classId = req.query.classId as string;
        const deckId = req.query.deckId as string;
        const ownerId = req.user._id;

        if (!classId || !deckId) {
            return res.status(400).json({ message: 'Missing classId or deckId' });
        }

        const result = await classService.removeDeckFromClassService(classId, deckId, ownerId);
        res.status(200).json(result);
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        return res.status(400).json({ message: 'Failed to remove deck from class', error: errMsg });
    }
};

export const addDeckToClass = async (req: Request, res: Response) => {
    try {
        const ownerId = req.user._id;
        const { classId, deckId, description, startTime, endTime } = req.body;

        if (!classId || !deckId) {
            return res.status(400).json({ message: 'Missing classId or deckId' });
        }

        const result = await classService.addDeckToClassService({
            classId,
            deckId,
            description,
            startTime,
            endTime,
            ownerId
        });

        res.status(200).json(result);
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        return res.status(400).json({ message: 'Failed to add deck to class', error: errMsg });
    }
};

export const getDecksToAddToClass = async (req: Request, res: Response) => {
    try {
        const { _id } = req.params;
        const decks = await classService.getDecksToAddToClassService(_id);
        res.status(200).json(decks);
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        return res.status(400).json({ message: 'Failed to get deck to add class', error: errMsg });
    }
};

export const getClassUserById = async (req: Request, res: Response) => {
    try {
        const { _id } = req.params;
        const userId = req.user._id;
        const classItem = await classService.getClassUserByIdService(_id, userId);
        res.status(200).json(classItem);
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        return res.status(400).json({ message: 'Failed to get class user by id', error: errMsg });
    }
};

export const startClassDeckSession = async (req: Request, res: Response) => {
    try {
        const userId = req.user._id;
        const { classId, deckId } = req.params;
        const { forceNew } = req.body || {};

        const result = await classService.startClassDeckSessionService(userId, classId, deckId, forceNew);

        return res.status(201).json(result);
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        return res.status(500).json({ message: 'Failed to start class deck session', error: errMsg });
    }
};

export const saveClassDeckAnswer = async (req: Request, res: Response) => {
    try {
        const userId = req.user._id;
        const { classId, deckId } = req.params;
        const { sessionId, cardId, correct } = req.body;

        const result = await classService.saveClassDeckAnswerService(
            userId,
            classId,
            deckId,
            sessionId,
            cardId,
            correct
        );

        return res.status(200).json(result);
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        return res.status(500).json({ message: 'Failed to save class deck answer', error: errMsg });
    }
};

export const endClassDeckSession = async (req: Request, res: Response) => {
    try {
        const userId = req.user._id;
        const { classId, deckId } = req.params;
        const { sessionId, duration } = req.body;

        const result = await classService.endClassDeckSessionService(userId, classId, deckId, sessionId, duration);

        return res.status(200).json(result);
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        return res.status(500).json({ message: 'Failed to end class deck session', error: errMsg });
    }
};

export const getClassDeckSessionHistory = async (req: Request, res: Response) => {
    try {
        const userId = req.user._id;
        const { classId, deckId } = req.params;

        const result = await classService.getClassDeckSessionHistoryService(userId, classId, deckId);

        return res.status(200).json(result);
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        return res.status(500).json({ message: 'Failed to get class deck session history', error: errMsg });
    }
};

export const getOverdueSchedules = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user._id;
        const overdueSchedules = await classService.getOverdueSchedulesService(userId);

        res.status(200).json(overdueSchedules);
    } catch (error) {
        next(error);
    }
};

export const getUpcomingDeadlines = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user._id;
        const upcomingDeadlines = await classService.getUpcomingDeadlinesService(userId);
        res.status(200).json(upcomingDeadlines);
    } catch (error) {
        next(error);
    }
};

export const getAllNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user._id;
        const notifications = await classService.getAllNotificationsService(userId);
        res.status(200).json(notifications);
    } catch (error) {
        next(error);
    }
};

export const cancelInvite = async (req: Request, res: Response) => {
    try {
        const { classId, userId } = req.params;
        const ownerId = req.user._id;

        if (!classId || !userId) {
            return res.status(400).json({ message: 'Missing classId or userId' });
        }

        const result = await classService.cancelInviteService(classId, userId, ownerId);
        res.status(200).json(result);
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        return res.status(400).json({ message: 'Failed to cancel invite', error: errMsg });
    }
};

export const getClassMemberProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const classId = req.params._id;
        const userId = req.user._id;

        const progress = await classService.getClassMemberProgressService(classId, userId);

        res.status(200).json(progress);
    } catch (error) {
        next(error);
    }
};
