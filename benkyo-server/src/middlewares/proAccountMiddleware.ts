import { Request, Response, NextFunction } from 'express';
import { NotFoundException } from '~/exceptions/notFound';
import { ErrorCode } from '~/exceptions/root';
import { UnauthorizedException } from '~/exceptions/unauthorized';
import { PackageType, User } from '~/schemas';

export const checkProStatus = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;
    if (!userId)
        throw new UnauthorizedException('Unauthorized, please login account to continue.', ErrorCode.UNAUTHORIZED);

    const user = await User.findById(userId);

    if (!user) throw new NotFoundException('User not found', ErrorCode.NOT_FOUND);

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
};
