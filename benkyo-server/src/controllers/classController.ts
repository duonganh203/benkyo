import { Request, Response } from 'express';
import { classValidation } from '~/validations/classValidation';
import * as classService from '../services/classService';

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
        res.status(400).json({ message: 'Failed to update class', error });
    }
};

export const deleteClass = async (req: Request, res: Response) => {
    try {
        const classId = req.params._id;
        const userId = req.user._id;

        const result = await classService.deleteClassService(classId, userId);

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: 'Failed to delete class', error });
    }
};

export const getClassUpdateById = async (req: Request, res: Response) => {
    try {
        const classId = req.params._id;
        const userId = req.user._id;

        const classData = await classService.getClassUpdateByIdService(classId, userId);

        res.status(200).json(classData);
    } catch (error) {
        res.status(400).json({ message: 'Failed to get class', error });
    }
};

export const getClassListUser = async (req: Request, res: Response) => {
    try {
        const classData = await classService.getClassListUserService();

        res.status(200).json(classData);
    } catch (error) {
        res.status(400).json({ message: 'Failed to get class list', error });
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
        res.status(400).json({ message: 'Failed to get class list', error });
    }
};

export const getClassManagementById = async (req: Request, res: Response) => {
    try {
        const classId = req.params._id;
        const userId = req.user._id;
        const classData = await classService.getClassManagementByIdService(classId, userId);

        res.status(200).json(classData);
    } catch (error) {
        res.status(400).json({ message: 'Failed to get class list', error });
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
        res.status(400).json({ message: 'Failed to get class list', error });
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
        res.status(400).json({ message: 'Failed to get invite class list', error });
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
        res.status(400).json({ message: 'Failed to add deck to class', error });
    }
};

export const getDecksToAddToClass = async (req: Request, res: Response) => {
    try {
        const { _id } = req.params;
        const decks = await classService.getDecksToAddToClassService(_id);
        res.status(200).json(decks);
    } catch (error) {
        res.status(400).json({ message: 'Failed to get deck to add class', error });
    }
};

export const getClassUserById = async (req: Request, res: Response) => {
    const { _id } = req.params;
    const userId = req.user.id;
    const classItem = await classService.getClassUserByIdService(_id, userId);
    res.json(classItem);
};
