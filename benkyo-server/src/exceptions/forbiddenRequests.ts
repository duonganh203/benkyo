import { ErrorCode, HttpException } from './root';
import { StatusCodes } from 'http-status-codes';
export class ForbiddenRequestsException extends HttpException {
    constructor(message: string, errorCode: ErrorCode) {
        super(message, errorCode, StatusCodes.FORBIDDEN, null);
    }
}
