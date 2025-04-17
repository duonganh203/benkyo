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

    const userIdMatch = description.match(/[0-9a-fA-F]{24}/);
    const userId = userIdMatch?.[0];
    if (!userId) {
        console.log('User ID not found in description:', userId);
        return;
    }

    const possiblePackages = ['basic', 'pro', 'premium'];
    const tokens = description.toLowerCase().split(/[^a-zA-Z0-9]/);
    const foundPackage = tokens.find((token) => possiblePackages.some((pkg) => token.includes(pkg)));
    if (!foundPackage) {
        console.log('Package type not found: ', foundPackage);
        return;
    }

    const packageType = possiblePackages.find((pkg) => foundPackage.includes(pkg))!;
    const normalizedPackage = packageType.charAt(0).toUpperCase() + packageType.slice(1).toLowerCase();

    const existedUser = await User.findById(userId);
    if (!existedUser) {
        console.log('User not found: ', existedUser);
        return;
    }

    const existedPackage = await Package.findOne({
        type: normalizedPackage,
        price: transactionData.amount,
        isActive: true
    });
    if (!existedPackage) {
        console.log('Package not found or price mismatch: ', existedPackage);
        return;
    }

    const existedTransaction = await Transaction.findOne({ user: userId });
    if (!existedTransaction) {
        console.log('Transaction not found: ', existedTransaction);
        return;
    }

    existedTransaction.set({
        ...transactionData,
        isPaid: true,
        package: existedPackage._id
    });
    await existedTransaction.save();

    const durationToMonths: Record<string, number> = {
        '3T': 3,
        '6T': 6,
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
    console.log('Transaction success & User upgraded successfully');
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
