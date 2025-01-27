import { StatusCodes } from 'http-status-codes';
import { ErrorCode, HttpException } from './root';

export class InternalException extends HttpException {
    constructor(message: string, errorCode: ErrorCode, error: any) {
        super(message, errorCode, StatusCodes.INTERNAL_SERVER_ERROR, error);
    }
}
