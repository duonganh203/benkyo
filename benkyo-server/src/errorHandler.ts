import { NextFunction, Request, Response } from 'express';
import { ErrorCode, HttpException } from './exceptions/root';
import { InternalException } from './exceptions/internalException';
import { UnprocessableEntity } from './exceptions/unprocessableEntity';
import { ZodError } from 'zod';

export const errorHandler = (method: (req: Request, res: Response, next: NextFunction) => void) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await method(req, res, next);
        } catch (error: any) {
            let exception: HttpException;
            if (error instanceof HttpException) {
                exception = error;
            } else if (error instanceof ZodError) {
                exception = new UnprocessableEntity(
                    error.errors,
                    'Unprocessable Entity',
                    ErrorCode.UNPROCESSALE_ENTITY
                );
            } else {
                exception = new InternalException('Something went wrong!', ErrorCode.INTERNAL_SERVER_ERROR, error);
            }
            next(exception);
        }
    };
};
