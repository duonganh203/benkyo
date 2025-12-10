export interface QRInfoInterface {
    _id: string;
    isPaid: boolean;
    user: {
        _id: string;
        name: string;
    };
    package: {
        _id: string;
        type: string;
        price: number;
    };
    expiredAt: string;
}

export interface IsPaidInterface {
    _id: string;
    isPaid: boolean;
    package: {
        _id: string;
        type: string;
    };
}

export interface PackageInterface {
    _id: string;
    name: string;
    type: string;
    duration: string;
    price: number;
    features: string[];
    isActive: boolean;
}

export interface TopupInterface {
    _id: string;
    user: {
        _id: string;
        name: string;
    };
    amount: number;
    isPaid: boolean;
    createdAt: string;
    updatedAt: string;
}

export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELED' | 'EXPIRED' | 'REJECTED' | 'PAID';

export type TransactionDirection = 'IN' | 'OUT';

export type TransactionKind = 'PACKAGE' | 'TOPUP' | 'PAYOUT';

export interface TransactionItem {
    _id: string;
    tid?: string;
    type: TransactionKind;
    direction?: TransactionDirection;
    amount: number;
    currency?: string;
    status: TransactionStatus;

    createdAt?: string;
    when?: string;

    description?: string;
    note?: string;
    paymentMethod?: string;

    paidAt?: string;

    payout?: {
        bankAbbreviation?: string;
        accountNumber?: string;
        accountName?: string;
    };

    package?: {
        name?: string;
        price?: number;
        type?: string;
        duration?: string;
    };
}

export interface PayoutRequestPayload {
    amount: number;
    currency?: string;
    bankAbbreviation: string;
    accountNumber: string;
    accountName: string;
    branch?: string;
    paymentMethod?: string;
    description?: string;
    note?: string;
}

export interface BuyPackageWithWalletResponse {
    success: boolean;
    message: string;
    isPro: boolean;
    proType: string;
    proExpiryDate: string;
}
