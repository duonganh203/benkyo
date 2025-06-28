import { NextFunction, Request, Response } from 'express';

import {
    getStudyStreakService,
    getTopLongestStudyStreakService,
    updateStudyStreakService
} from '~/services/streakService';

export const updateStudyStreakController = async (req: Request, res: Response) => {
    const result = await updateStudyStreakService(req.user._id);
    res.json(result);
};

export const getStudyStreakController = async (req: Request, res: Response) => {
    const result = await getStudyStreakService(req.user._id);
    res.json(result);
};

export const getTopLongestStudyStreakController = async (req: Request, res: Response, next: NextFunction) => {
    const limit = Number(req.query.limit) || 10;
    const users = await getTopLongestStudyStreakService(limit);

    res.json({ success: true, data: users });
};
