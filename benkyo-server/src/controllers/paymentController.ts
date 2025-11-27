import 'dotenv/config';
import { Request, Response } from 'express';
import {
    checkPaid,
    findAllPackages,
    getTransaction,
    saveTransaction,
    getDashboardMetricsService,
    getMonthlyRevenueService,
    getQuarterlyRevenueService,
    createTopupTransaction
} from '~/services/paymentService';

export const webhook = async (req: Request, res: Response) => {
    const transactionData = {
        type: 'PACKAGE' as const,
        tid: req.body.data.tid,
        description: req.body.data.description,
        amount: req.body.data.amount,
        when: req.body.data.when,
        bank_sub_acc_id: req.body.data.bank_sub_acc_id,
        subAccId: req.body.data.subAccId,
        bankName: req.body.data.bankName,
        bankAbbreviation: req.body.data.bankAbbreviation,
        corresponsiveAccount: req.body.data.corresponsiveAccount
    };

    const response = await saveTransaction(transactionData);
    return res.json(response);
};

export const getInformationQR = async (req: Request, res: Response) => {
    const { packageId } = req.params;
    const payment = await getTransaction(req.user._id, packageId);
    return res.json(payment);
};

export const createTopup = async (req: Request, res: Response) => {
    const { amount } = req.body as { amount: number };
    const data = await createTopupTransaction(req.user._id, amount);
    return res.json(data);
};

export const getIsPaid = async (req: Request, res: Response) => {
    const { transactionId } = req.params;
    const isPaid = await checkPaid(req.user._id, transactionId);
    return res.json(isPaid);
};

export const getAllPackages = async (req: Request, res: Response) => {
    const packages = await findAllPackages();
    return res.json(packages);
};

export const getDashboardMetrics = async (req: Request, res: Response) => {
    const year = req.query.year as string;
    const metrics = await getDashboardMetricsService(year);
    res.json(metrics);
};

export const getMonthlyRevenue = async (req: Request, res: Response) => {
    const year = req.query.year as string;
    const data = await getMonthlyRevenueService(year);
    res.status(200).json(data);
};

export const getQuarterlyRevenue = async (req: Request, res: Response) => {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const data = await getQuarterlyRevenueService(year);
    res.json(data);
};
