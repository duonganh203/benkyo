export interface QRInfoInterface {
    _id: string;
    isPaid: boolean;
    user: {
        _id: string;
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
}
