export interface ApiError {
    message: string;
    statusCode?: number;
    errorCode: number;
    errors: any;
}
