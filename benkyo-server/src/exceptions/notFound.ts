import { ErrorCode, HttpException } from './root';
import { StatusCodes } from 'http-status-codes';
export class NotFoundException extends HttpException {
    constructor(message: string, errorCode: ErrorCode) {
        super(message, errorCode, StatusCodes.NOT_FOUND, null);
    }
}
