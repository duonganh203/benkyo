import 'dotenv/config';
import { Request, Response } from 'express';
import { checkPaid, findAllPackages, getTransaction, saveTransaction } from '~/services/paymentService';

export const webhook = async (req: Request, res: Response) => {
    const transactionData = {
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

export const getIsPaid = async (req: Request, res: Response) => {
    const { transactionId } = req.params;
    const isPaid = await checkPaid(req.user._id, transactionId);
    return res.json(isPaid);
};

export const getAllPackages = async (req: Request, res: Response) => {
    const packages = await findAllPackages();
    return res.json(packages);
};
