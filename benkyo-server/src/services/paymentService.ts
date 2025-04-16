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
    console.log('transactionData:', transactionData);

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

    const now = new Date();
    const currentExpiry =
        existedUser.proExpiryDate && existedUser.proExpiryDate > now ? existedUser.proExpiryDate : now;

    existedUser.set({
        isPro: true,
        proExpiryDate: new Date(currentExpiry.setMonth(currentExpiry.getMonth() + months))
    });
    await existedUser.save();

    return 'Transaction success & User upgraded successfully';
};
