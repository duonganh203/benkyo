import 'dotenv/config';
import { Request, Response } from 'express';
import { checkPaid, getTransaction, saveTransaction } from '~/services/paymentService';

export const webhook = async (req: Request, res: Response) => {
    const transactionData = {
        tid: req.body.data[0].tid,
        description: req.body.data[0].description,
        amount: req.body.data[0].amount,
        when: req.body.data[0].when,
        bank_sub_acc_id: req.body.data[0].bank_sub_acc_id,
        subAccId: req.body.data[0].subAccId,
        bankName: req.body.data[0].bankName,
        bankAbbreviation: req.body.data[0].bankAbbreviation,
        corresponsiveAccount: req.body.data[0].corresponsiveAccount
    };
    const result = await saveTransaction(transactionData);
    res.json({ message: result });
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
