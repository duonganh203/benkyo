// import { Types } from 'mongoose';
export type RejectPayoutInput = {
    transactionId: string;
    adminId: string;
    reason: string;
};
