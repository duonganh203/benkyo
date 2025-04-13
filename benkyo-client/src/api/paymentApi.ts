import { QRInfoInterface } from '@/types/payment';
import { api } from '.';

export const getQRInformation = async (packageId: string) => {
    const response = await api.get(`payment/qr/${packageId}`);
    return response.data as QRInfoInterface;
};

export const checkIsPaid = async (transactionId: string) => {
    const response = await api.get(`payment/checkPaid/${transactionId}`);
    return response.data as QRInfoInterface;
};
