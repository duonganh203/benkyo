import { ErrorCode, HttpException } from './root';
import { StatusCodes } from 'http-status-codes';
export class UnauthorizedException extends HttpException {
    constructor(message: string, errorCode: ErrorCode, errors?: any) {
        super(message, errorCode, StatusCodes.UNAUTHORIZED, errors);
    }
}
