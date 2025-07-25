import { Request, Response, NextFunction } from 'express';
import { classValidation } from '~/validations/classValidation';
import * as classService from '../services/classService';
import { UserClassState } from '../schemas';
import { Types } from 'mongoose';
import { Card } from '../schemas';

export const createClass = async (req: Request, res: Response) => {
    const classData = classValidation.parse(req.body);
    const userId = req.user._id;

    const safeClassData = {
        ...classData,
        description: classData.description ?? ''
    };

    const newClass = await classService.createClassService(userId, safeClassData);

    const response = {
        ...newClass,
        message: 'Create Class successfully'
    };

    res.status(201).json(response);
};

export const updateClass = async (req: Request, res: Response) => {
    try {
        const classId = req.params._id;
        const classData = classValidation.parse(req.body);
        const userId = req.user._id;

        const updatedClass = await classService.updateClassService(classId, userId, classData);

        res.status(200).json({
            ...updatedClass,
            message: 'Update Class successfully'
        });
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        res.status(400).json({ message: 'Failed to update class', error: errMsg });
    }
};

export const deleteClass = async (req: Request, res: Response) => {
    try {
        const classId = req.params._id;
        const userId = req.user._id;

        const result = await classService.deleteClassService(classId, userId);

        res.status(200).json(result);
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        res.status(400).json({ message: 'Failed to delete class', error: errMsg });
    }
};

export const getClassUpdateById = async (req: Request, res: Response) => {
    try {
        const classId = req.params._id;
        const userId = req.user._id;

        const classData = await classService.getClassUpdateByIdService(classId, userId);

        res.status(200).json(classData);
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        res.status(400).json({ message: 'Failed to get class', error: errMsg });
    }
};

export const getClassListUser = async (req: Request, res: Response) => {
    try {
        const classData = await classService.getClassListUserService();

        res.status(200).json(classData);
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        res.status(400).json({ message: 'Failed to get class list', error: errMsg });
    }
};

export const getMyClassList = async (req: Request, res: Response) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 5;

        const classData = await classService.getMyClassListService(userId, page, limit);

        res.status(200).json(classData);
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        res.status(400).json({ message: 'Failed to get class list', error: errMsg });
    }
};

export const getClassManagementById = async (req: Request, res: Response) => {
    try {
        const classId = req.params._id;
        const userId = req.user._id;
        const classData = await classService.getClassManagementByIdService(classId, userId);

        res.status(200).json(classData);
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        res.status(400).json({ message: 'Failed to get class', error: errMsg });
    }
};

export const getSuggestedClassList = async (req: Request, res: Response) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 5;

        const classData = await classService.getSuggestedListService(userId, page, limit);

        res.status(200).json(classData);
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        res.status(400).json({ message: 'Failed to get class list', error: errMsg });
    }
};

export const requestJoinClass = async (req: Request, res: Response) => {
    try {
        const { _id } = req.params;
        const userId = req.user._id;
        const result = await classService.requestJoinClasssService(_id, userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: 'Failed request join class', error });
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
        res.status(400).json({ message: 'Failed to accept join request', error });
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
        res.status(400).json({ message: 'Failed to reject join request', error });
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
        res.status(400).json({ message: 'Failed to invite member', error });
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
        res.status(200).json({ ...result, message: 'Accepted class invitation successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Failed to accept class invitation', error });
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
        res.status(200).json({ ...result, message: 'Rejected class invitation successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Failed to reject class invitation', error });
    }
};

export const getInviteClass = async (req: Request, res: Response) => {
    try {
        const userId = req.user._id;
        const result = await classService.getInviteClassService(userId);
        res.status(200).json(result);
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        res.status(400).json({ message: 'Failed to get invite class list', error: errMsg });
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
        res.status(400).json({ message: 'Failed to remove user from class', error });
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
        res.status(400).json({ message: 'Failed to remove deck from class', error });
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

        res.status(200).json({ ...result, message: 'Deck added to class successfully' });
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        res.status(400).json({ message: 'Failed to add deck to class', error: errMsg });
    }
};

export const getDecksToAddToClass = async (req: Request, res: Response) => {
    try {
        const { _id } = req.params;
        const decks = await classService.getDecksToAddToClassService(_id);
        res.status(200).json(decks);
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        res.status(400).json({ message: 'Failed to get deck to add class', error: errMsg });
    }
};

export const getClassUserById = async (req: Request, res: Response) => {
    const { _id } = req.params;
    const userId = req.user.id;
    const classItem = await classService.getClassUserByIdService(_id, userId);
    res.json(classItem);
};

export const startClassStudySession = async (req: Request, res: Response) => {
    try {
        const userId = req.user._id;
        const classId = req.params.classId;
        const deckId = req.params.deckId;
        const forceNew = req.body.forceNew === true;

        const unfinishedSession = await UserClassState.findOne({
            user: userId,
            class: classId,
            deck: deckId,
            endTime: { $exists: false }
        });

        if (unfinishedSession && !forceNew) {
            return res
                .status(200)
                .json({ success: true, data: unfinishedSession, message: 'Resume unfinished session' });
        }

        const newSession = await UserClassState.create({
            user: userId,
            class: classId,
            deck: deckId,
            completedCardIds: [],
            correctCount: 0,
            totalCount: 0,
            startTime: new Date()
        });
        return res.status(201).json({ success: true, data: newSession, message: 'Started new session' });
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        res.status(400).json({ success: false, error: errMsg });
    }
};

export const startClassDeckSession = async (req: Request, res: Response) => {
    try {
        const userId = req.user._id;
        const { classId, deckId } = req.params;
        const { forceNew } = req.body || {};

        const allCards = await Card.find({ deck: deckId }).lean();

        let session = await UserClassState.findOne({
            user: userId,
            class: classId,
            deck: deckId,
            endTime: { $exists: false }
        });

        if (!session && !forceNew) {
            session = await UserClassState.findOne({
                user: userId,
                class: classId,
                deck: deckId
            }).sort({ createdAt: -1 });

            if (session) {
                session.endTime = undefined;
                await session.save();
            }
        }

        if (session && !forceNew) {
            const remainingCards = allCards.filter(
                (card) =>
                    !session!.completedCardIds.some((completedId) => completedId.toString() === card._id.toString())
            );

            const isResumed = session.completedCardIds.length > 0;

            return res.status(200).json({
                success: true,
                data: session,
                cards: remainingCards,
                resumed: isResumed
            });
        }

        session = new UserClassState({
            user: userId,
            class: classId,
            deck: deckId,
            completedCardIds: [],
            correctCount: 0,
            totalCount: 0,
            startTime: new Date()
        });
        await session.save();

        return res.status(201).json({
            success: true,
            data: session,
            cards: allCards,
            resumed: false
        });
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        return res.status(500).json({ success: false, error: errMsg });
    }
};

export const saveClassDeckAnswer = async (req: Request, res: Response) => {
    try {
        const userId = req.user._id;
        const { classId, deckId } = req.params;
        const { sessionId, cardId, correct } = req.body;

        const session = await UserClassState.findOne({
            _id: sessionId,
            user: userId,
            class: classId,
            deck: deckId
        });

        if (!session) {
            return res.status(404).json({ success: false, error: 'Session not found' });
        }

        if (!session.completedCardIds.includes(cardId)) {
            session.completedCardIds.push(cardId);

            if (correct) {
                session.correctCount += 1;
            }
            session.totalCount += 1;
        }

        await session.save();

        return res.status(200).json({ success: true, data: session });
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        return res.status(500).json({ success: false, error: errMsg });
    }
};

export const endClassDeckSession = async (req: Request, res: Response) => {
    try {
        const userId = req.user._id;
        const { classId, deckId } = req.params;
        const { sessionId, duration } = req.body;

        const session = await UserClassState.findOne({
            _id: sessionId,
            user: userId,
            class: classId,
            deck: deckId
        });
        if (!session) {
            return res.status(404).json({ success: false, error: 'Session not found' });
        }

        session.duration = duration;
        session.endTime = new Date();
        await session.save();

        return res.status(200).json({ success: true, data: session });
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        return res.status(500).json({ success: false, error: errMsg });
    }
};

export const getClassDeckSessionHistory = async (req: Request, res: Response) => {
    try {
        const userId = req.user._id;
        const { classId, deckId } = req.params;
        const sessions = await UserClassState.find({
            user: userId,
            class: classId,
            deck: deckId
        }).sort({ startTime: -1 });
        return res.status(200).json({ success: true, data: sessions });
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        return res.status(500).json({ success: false, error: errMsg });
    }
};

export const getClassDeckSessionBest = async (req: Request, res: Response) => {
    try {
        const userId = req.user._id;
        const { classId, deckId } = req.params;
        const bestSession = await UserClassState.findOne({
            user: userId,
            class: classId,
            deck: deckId,
            endTime: { $exists: true }
        }).sort({ correctCount: -1, endTime: -1 });
        return res.status(200).json({ success: true, data: bestSession });
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        return res.status(500).json({ success: false, error: errMsg });
    }
};

export const getClassDeckSessionLeaderboard = async (req: Request, res: Response) => {
    try {
        const { classId, deckId } = req.params;
        const pipeline = [
            {
                $match: {
                    class: new Types.ObjectId(classId),
                    deck: new Types.ObjectId(deckId),
                    endTime: { $exists: true }
                }
            },
            { $sort: { correctCount: -1 as -1, endTime: -1 as -1 } },
            {
                $group: {
                    _id: '$user',
                    session: { $first: '$$ROOT' }
                }
            },
            { $replaceRoot: { newRoot: '$session' } },
            { $sort: { correctCount: -1 as -1, endTime: -1 as -1 } },
            { $limit: 10 }
        ];
        const leaderboard = await UserClassState.aggregate(pipeline);
        return res.status(200).json({ success: true, data: leaderboard });
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        return res.status(500).json({ success: false, error: errMsg });
    }
};

export const getOverdueSchedules = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user._id;
        const overdueSchedules = await classService.getOverdueSchedulesService(userId);

        res.status(200).json({
            success: true,
            data: overdueSchedules,
            message: 'Overdue schedules retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const getUpcomingDeadlines = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user._id;
        const upcomingDeadlines = await classService.getUpcomingDeadlinesService(userId);
        res.status(200).json({
            success: true,
            data: upcomingDeadlines,
            message: 'Upcoming deadlines retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const getAllNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user._id;
        const notifications = await classService.getAllNotificationsService(userId);
        res.status(200).json({
            success: true,
            data: notifications,
            message: 'All notifications retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};
