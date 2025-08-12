import { ErrorCode, HttpException } from './root';
import { StatusCodes } from 'http-status-codes';
export class ConflictException extends HttpException {
    constructor(message: string, errorCode: ErrorCode) {
        super(message, errorCode, StatusCodes.CONFLICT, null);
    }
}
