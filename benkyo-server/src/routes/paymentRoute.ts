import { Router } from 'express';
import { webhook } from '~/controllers/paymentController';
import { errorHandler } from '~/errorHandler';

const paymentRoutes: Router = Router();

paymentRoutes.post('/webhook', errorHandler(webhook));

export default paymentRoutes;
