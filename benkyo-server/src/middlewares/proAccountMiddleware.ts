import { Request, Response, NextFunction } from 'express';
import { NotFoundException } from '~/exceptions/notFound';
import { ErrorCode } from '~/exceptions/root';
import { UnauthorizedException } from '~/exceptions/unauthorized';
import { PackageType, User } from '~/schemas';

const checkProAccountMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?._id;
        if (!userId)
            return next(new UnauthorizedException('Unauthorized, please login to continue.', ErrorCode.UNAUTHORIZED));

        const user = await User.findById(userId);
        if (!user) return next(new NotFoundException('User not found.', ErrorCode.NOT_FOUND));

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
        next(error);
    }
};

export default checkProAccountMiddleware;
