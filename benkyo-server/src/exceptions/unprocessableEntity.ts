import { ErrorCode, HttpException } from './root';
import { StatusCodes } from 'http-status-codes';
export class UnprocessableEntity extends HttpException {
    constructor(error: any, message: string, errorCode: ErrorCode) {
        super(message, errorCode, StatusCodes.UNPROCESSABLE_ENTITY, error);
    }
}
