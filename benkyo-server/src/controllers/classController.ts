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
        ...newClass.toObject(),
        message: 'Create Class successfully'
    };

    res.status(201).json(response);
};
