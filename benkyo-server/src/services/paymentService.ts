import 'dotenv/config';
import { NotFoundException } from '~/exceptions/notFound';
import { ErrorCode } from '~/exceptions/root';
import { TransactionType, Transaction, User, Package } from '~/schemas';

type CreateTransactionPayload = Omit<
    TransactionType,
    'isPaid' | 'expiredAt' | 'createdAt' | 'updatedAt' | 'user' | 'package'
> & {
    description: string;
};

export const saveTransaction = async (transactionData: CreateTransactionPayload) => {
    const [userBuy, packageBuy] = transactionData.description.toString().split(' ');

    const existedUser = await User.findById(userBuy);
    if (!existedUser) {
        throw new NotFoundException('User not found', ErrorCode.NOT_FOUND);
    }

    const existedPackage = await Package.findOne({
        type: packageBuy,
        price: transactionData.amount,
        isActive: true
    });
    if (!existedPackage) {
        throw new NotFoundException('Package not found', ErrorCode.NOT_FOUND);
    }

    const existedTransaction = await Transaction.findOne({ user: userBuy });
    if (!existedTransaction) {
        throw new NotFoundException('Transaction not found', ErrorCode.NOT_FOUND);
    }

    existedTransaction.set({
        ...transactionData,
        isPaid: true,
        package: existedPackage._id
    });
    await existedTransaction.save();

    const durationToMonths: Record<string, number> = {
        '3M': 3,
        '6M': 6,
        '1Y': 12
    };

    const months = durationToMonths[existedPackage.duration] || 1;
    const now = new Date();

    existedUser.set({
        isPro: true,
        proType: existedPackage.type,
        proExpiryDate: new Date(now.setMonth(now.getMonth() + months))
    });
    await existedUser.save();

    return 'Transaction success & User upgraded successfully';
};

export const getTransaction = async (userId: string, packageId: string) => {
    let transaction = await Transaction.findOne({
        user: userId,
        expiredAt: { $gt: Date.now() },
        package: packageId
    });

    if (!transaction) {
        transaction = await new Transaction({
            user: userId,
            package: packageId,
            isPaid: false
        }).save();
    }

    transaction = await Transaction.findById(transaction._id)
        .select('_id isPaid expiredAt')
        .populate('user', '_id name')
        .populate('package', 'type price ');
    return transaction;
};

export const checkPaid = async (userId: string, transactionId: string) => {
    const transaction = await Transaction.findOne({ user: userId, _id: transactionId }).select('isPaid');

    if (!transaction) {
        throw new NotFoundException('Transaction not found', ErrorCode.NOT_FOUND);
    }

    return transaction;
};
