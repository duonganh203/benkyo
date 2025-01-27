import { ErrorCode, HttpException } from './root';
import { StatusCodes } from 'http-status-codes';
export class BadRequestsException extends HttpException {
    constructor(message: string, errorCode: ErrorCode) {
        super(message, errorCode, StatusCodes.BAD_REQUEST, null);
    }
}
