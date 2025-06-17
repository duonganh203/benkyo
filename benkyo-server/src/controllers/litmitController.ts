import { Request, Response } from 'express';
import { checkRemainingCredits, deductUserCredit } from '~/services/limitService';

export const getRemainingCredits = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const func = req.body.func;
    const remainingCredits = await checkRemainingCredits(userId, func);
    return res.json({ remainingCredits });
};

export const deductCredits = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const func = req.body.func;
    await deductUserCredit(userId, func);
};
