import e, { Request, Response } from 'express';
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
