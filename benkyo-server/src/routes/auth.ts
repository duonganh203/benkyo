import { Router } from 'express';
import { login, register } from '~/controllers/auth';

const authRoutes: Router = Router();

authRoutes.post('/login', login);
authRoutes.post('/register', register);

export default authRoutes;
