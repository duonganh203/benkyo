import { Request, Response } from 'express';

import { getLoginStreakService, updateLoginStreakService } from '~/services/streakService';

export const updateLoginStreakController = async (req: Request, res: Response) => {
    const result = await updateLoginStreakService(req.user._id);
    res.json(result);
};

export const getLoginStreakController = async (req: Request, res: Response) => {
    const result = await getLoginStreakService(req.user._id);
    res.json(result);
};
