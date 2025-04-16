import { Router } from 'express';
import { webhook, getInformationQR, getIsPaid, getAllPackages } from '~/controllers/paymentController';
import { errorHandler } from '~/errorHandler';
import authMiddleware from '~/middlewares/authMiddleware';

const paymentRoutes: Router = Router();

paymentRoutes.get('/package', errorHandler(getAllPackages));
paymentRoutes.post('/webhook', errorHandler(webhook));
paymentRoutes.get('/qr/:packageId', [authMiddleware], errorHandler(getInformationQR));
paymentRoutes.get('/checkPaid/:transactionId', [authMiddleware], errorHandler(getIsPaid));

export default paymentRoutes;
