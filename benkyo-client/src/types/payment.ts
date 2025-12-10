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

export interface BuyPackageWithWalletResponse {
    success: boolean;
    message: string;
    isPro: boolean;
    proType: string;
    proExpiryDate: string;
}
