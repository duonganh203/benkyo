import 'dotenv/config';
import { NotFoundException } from '~/exceptions/notFound';
import { ErrorCode } from '~/exceptions/root';
import { TransactionType, Transaction, User, Package } from '~/schemas';
import { Types } from 'mongoose';

type CreateTransactionPayload = Omit<
    TransactionType,
    'isPaid' | 'expiredAt' | 'createdAt' | 'updatedAt' | 'user' | 'package'
> & {
    description: string;
};

export const saveTransaction = async (transactionData: CreateTransactionPayload) => {
    const [userBuy, packageBuy] = transactionData.description.toString().split(' ');
    console.log('transactionData', transactionData);
    console.log('userBuy', userBuy);
    console.log('packageBuy', packageBuy);
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
        when: transactionData.when,
        bank_sub_acc_id: transactionData.bank_sub_acc_id,
        subAccId: transactionData.subAccId,
        bankName: transactionData.bankName,
        bankAbbreviation: transactionData.bankAbbreviation,
        corresponsiveAccount: transactionData.corresponsiveAccount,
        isPaid: true,
        package: existedPackage._id
    });
    await existedTransaction.save();

    let months = 1;
    switch (existedPackage.duration) {
        case '3M':
            months = 3;
            break;
        case '6M':
            months = 6;
            break;
        case '1Y':
            months = 12;
            break;
    }

    existedUser.set({
        isPro: true,
        proType: existedPackage.type,
        proExpiryDate: new Date(new Date().setMonth(new Date().getMonth() + months))
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
        .populate('user', '_id')
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
