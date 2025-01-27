import { User } from '~/schemas/user';
declare module 'express-serve-static-core' {
    export interface Request {
        user: User;
    }
}
