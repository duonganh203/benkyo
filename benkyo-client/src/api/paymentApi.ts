import {
    PackageInterface,
    QRInfoInterface,
    TopupInterface,
    TransactionItem,
    PayoutRequestPayload
} from '@/types/payment';
import { api } from '.';

export const getQRInformation = async (packageId: string) => {
    const response = await api.get(`payment/qr/${packageId}`);
    return response.data as QRInfoInterface;
};

export const checkIsPaid = async (transactionId: string) => {
    const response = await api.get(`payment/checkPaid/${transactionId}`);
    return response.data as QRInfoInterface;
};

export const getAllPackages = async () => {
    const response = await api.get(`payment/package`);
    return response.data as PackageInterface[];
};

export const getTopup = async (amount: number) => {
    const response = await api.post('payment/topup', { amount });
    return response.data as TopupInterface;
};

export const createPayout = async (payload: PayoutRequestPayload) => {
    const response = await api.post('payment/payouts', payload);
    return response.data as TransactionItem;
};

export const getTransactions = async () => {
    const response = await api.get('payment/transactions');
    return response.data as TransactionItem[];
};
