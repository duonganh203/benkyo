import { NextFunction, Request, Response } from 'express';
import { UnauthorizedException } from '~/exceptions/unauthorized';
import { ErrorCode } from '~/exceptions/root';
import authMiddleware from './authMiddleware';

const adminAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    await authMiddleware(req, res, async (err?: any) => {
        if (err) return next(err);

        if (!req.user || req.user.role !== 'admin') {
            return next(new UnauthorizedException('Admin access only', ErrorCode.UNAUTHORIZED));
        }

        next();
    });
};

export default adminAuthMiddleware;
