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
    const description = transactionData.description.toString().trim();
    console.log('transac', transactionData);

    const userIdMatch = description.match(/[0-9a-fA-F]{24}/);
    const userId = userIdMatch?.[0];
    console.log(userId);

    if (!userId) {
        throw new NotFoundException('User ID not found in description', ErrorCode.NOT_FOUND);
    }

    const possiblePackages = ['basic', 'pro', 'premium'];
    const tokens = description.toLowerCase().split(/[^a-zA-Z0-9]/);

    const foundPackage = tokens.find((token) => possiblePackages.some((pkg) => token.includes(pkg)));

    if (!foundPackage) {
        throw new NotFoundException('Package type not found in description', ErrorCode.NOT_FOUND);
    }

    const packageType = possiblePackages.find((pkg) => foundPackage.includes(pkg))!;
    const normalizedPackage = packageType.charAt(0).toUpperCase() + packageType.slice(1).toLowerCase();

    const existedUser = await User.findById(userId);
    if (!existedUser) {
        throw new NotFoundException('User not found', ErrorCode.NOT_FOUND);
    }

    const existedPackage = await Package.findOne({
        type: normalizedPackage,
        price: transactionData.amount,
        isActive: true
    });
    if (!existedPackage) {
        throw new NotFoundException('Package not found', ErrorCode.NOT_FOUND);
    }

    const existedTransaction = await Transaction.findOne({ user: userId });
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
    await Transaction.deleteMany({ expiredAt: { $lt: Date.now() }, isPaid: false, user: userId });
    const existPackage = await Package.findOne({ _id: packageId, isActive: true });

    if (!existPackage) {
        throw new NotFoundException('Package not found', ErrorCode.NOT_FOUND);
    }
    let transaction = await Transaction.findOne({
        user: userId,
        expiredAt: { $gt: Date.now() },
        package: packageId
    });

    if (!transaction) {
        transaction = await new Transaction({
            user: userId,
            isPaid: false,
            package: packageId
        }).save();
    }

    transaction = await Transaction.findById(transaction._id)
        .select('_id isPaid expiredAt')
        .populate('user', '_id name')
        .populate('package', 'type price ');
    return transaction;
};

export const checkPaid = async (userId: string, transactionId: string) => {
    const transaction = await Transaction.findOne({ user: userId, _id: transactionId })
        .select('isPaid')
        .populate('package', 'type');

    if (!transaction) {
        throw new NotFoundException('Transaction not found', ErrorCode.NOT_FOUND);
    }

    return transaction;
};

export const findAllPackages = async () => {
    const packages = await Package.find({ isActive: true });
    return packages;
};
