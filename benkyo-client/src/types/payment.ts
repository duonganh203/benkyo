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
