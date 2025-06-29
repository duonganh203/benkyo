import { Request, Response } from 'express';
import { getRemainingCredits, deductUserCredit } from '~/services/limitService';

export const getRemainingCredit = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const func = req.params.function;
    const remainingCredits = await getRemainingCredits(userId, func);
    return res.json({ remainingCredits });
};

export const deductCredits = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const func = req.params.function;
    await deductUserCredit(userId, func);
};
