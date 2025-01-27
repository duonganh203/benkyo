import 'dotenv/config';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { ErrorCode } from '~/exceptions/root';
import { UnauthorizedException } from '~/exceptions/unauthorized';
import { User } from '~/schemas/userSchema';
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    if (!token) return next(new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED));
    try {
        const JWT_SECRET = process.env.JWT_SECRET;
        const payload = jwt.verify(token, JWT_SECRET!);
        if (typeof payload === 'string') {
            return next(new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED));
        }
        const user = await User.findById(payload.id);
        if (!user) return next(new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED));
        req.user = user;
        next();
    } catch (error) {
        next(new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED, error));
    }
};

export default authMiddleware;
