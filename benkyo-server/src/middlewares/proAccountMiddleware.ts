import { Request, Response, NextFunction } from 'express';
import { ErrorCode } from '~/exceptions/root';
import { UnprocessableEntity } from '~/exceptions/unprocessableEntity';
import { PackageType, User } from '~/schemas';

export const checkProStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user._id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.isPro && user.proExpiryDate && user.proExpiryDate < new Date()) {
            user.isPro = false;
            user.proExpiryDate = null;
            user.proType = PackageType.BASIC;
            await user.save();
        }

        req.user = {
            ...req.user,
            isPro: user.isPro,
            proExpiresAt: user.proExpiryDate,
            proType: user.proType || PackageType.BASIC
        };

        next();
    } catch (error) {
        throw new UnprocessableEntity(error, 'Unable to process request', ErrorCode.INTERNAL_SERVER_ERROR);
    }
};
