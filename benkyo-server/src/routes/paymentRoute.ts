import { Router } from 'express';
import {
    webhook,
    getInformationQR,
    getIsPaid,
    getAllPackages,
    getDashboardMetrics,
    getMonthlyRevenue,
    getQuarterlyRevenue,
    createTopup,
    buyPackageWithWalletController
} from '~/controllers/paymentController';
import { errorHandler } from '~/errorHandler';
import authMiddleware from '~/middlewares/authMiddleware';

const paymentRoutes: Router = Router();

paymentRoutes.get('/package', [authMiddleware], errorHandler(getAllPackages));
paymentRoutes.post('/webhook', errorHandler(webhook));
paymentRoutes.get('/qr/:packageId', [authMiddleware], errorHandler(getInformationQR));
paymentRoutes.get('/checkPaid/:transactionId', [authMiddleware], errorHandler(getIsPaid));
paymentRoutes.get('/getDashboardMetrics', [authMiddleware], errorHandler(getDashboardMetrics));
paymentRoutes.get('/monthlyRevenue', [authMiddleware], errorHandler(getMonthlyRevenue));
paymentRoutes.get('/quarterlyRevenue', [authMiddleware], errorHandler(getQuarterlyRevenue));
paymentRoutes.post('/topup', [authMiddleware], errorHandler(createTopup));
paymentRoutes.post('/buy-with-wallet/:packageId', [authMiddleware], errorHandler(buyPackageWithWalletController));

export default paymentRoutes;
