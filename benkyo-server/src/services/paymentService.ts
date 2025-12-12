import 'dotenv/config';
import { NotFoundException } from '~/exceptions/notFound';
import { ErrorCode } from '~/exceptions/root';
import {
    TransactionType as TransactionDocument,
    Transaction,
    User,
    Package,
    PackageType,
    TransactionKind,
    TransactionStatus,
    TransactionDirection
} from '~/schemas';
import { BadRequestsException } from '~/exceptions/badRequests';
import { startOfYear, endOfYear } from 'date-fns';
type CreateTransactionPayload = Partial<
    Omit<TransactionDocument, 'type' | 'status' | 'expiredAt' | 'createdAt' | 'updatedAt' | 'user' | 'package'>
> & {
    description: string;
};

export const saveTransaction = async (transactionData: CreateTransactionPayload) => {
    const description = transactionData.description.toString().trim();

    const userIdMatch = description.match(/[0-9a-fA-F]{24}/);
    const userId = userIdMatch?.[0];
    if (!userId) {
        console.error('[Transaction Error] User ID not found in description:', {
            description,
            transactionData
        });
        return;
    }
    const existedUser = await User.findById(userId);
    if (!existedUser) {
        console.error('[Transaction Error] User not found:', {
            userId,
            description
        });
        return;
    }

    if (description.toLowerCase().includes('topup')) {
        console.log('Processing topup transaction:', transactionData);
        const amount = transactionData.amount;

        if (!amount || amount <= 0) {
            console.error('[Topup Error] Invalid amount (must be positive):', amount);
            return;
        }

        const existedTopupTx = await Transaction.findOne({
            user: userId,
            type: 'TOPUP',
            status: TransactionStatus.PENDING
        });

        if (!existedTopupTx) {
            console.error('[Topup Error] Pending topup transaction not found for user:', {
                userId,
                description
            });
            return;
        }

        existedTopupTx.set({
            ...transactionData,
            status: TransactionStatus.SUCCESS,
            amount,
            type: 'TOPUP'
        });
        await existedTopupTx.save();

        existedUser.balance = (existedUser.balance || 0) + amount;
        await existedUser.save();

        console.log('[Topup Success] User topped up successfully:', {
            userId,
            amount,
            newBalance: existedUser.balance
        });

        return 'Topup success';
    }

    const possiblePackages = ['basic', 'pro', 'premium'];
    const tokens = description.toLowerCase().split(/[^a-zA-Z0-9]/);
    const foundPackage = tokens.find((token) => possiblePackages.some((pkg) => token.includes(pkg)));
    if (!foundPackage) {
        console.error('[Transaction Error] Package type not found in description:', {
            userId,
            description,
            tokens
        });
        return;
    }

    const packageType = possiblePackages.find((pkg) => foundPackage.includes(pkg))!;
    const normalizedPackage = packageType.charAt(0).toUpperCase() + packageType.slice(1).toLowerCase();

    const existedPackage = await Package.findOne({
        type: normalizedPackage,
        price: transactionData.amount,
        isActive: true
    });
    if (!existedPackage) {
        console.error('[Transaction Error] Package not found or price mismatch:', {
            userId,
            description,
            normalizedPackage,
            price: transactionData.amount
        });
        return;
    }

    const existedTransaction = await Transaction.findOne({
        user: userId,
        package: existedPackage._id,
        status: TransactionStatus.PENDING
    });
    if (!existedTransaction) {
        console.error('[Transaction Error] Transaction not found for user:', {
            userId,
            description
        });
        return;
    }

    existedTransaction.set({
        ...transactionData,
        status: TransactionStatus.SUCCESS,
        package: existedPackage._id,
        type: 'PACKAGE'
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

    console.log('[Transaction Success] User upgraded successfully:', {
        userId,
        package: existedPackage.type,
        duration: existedPackage.duration,
        expiryDate: existedUser.proExpiryDate
    });

    return 'Transaction success & User upgraded successfully';
};

export const createTopupTransaction = async (userId: string, amount: number) => {
    if (!amount || amount <= 0) {
        throw new BadRequestsException('Invalid topup amount', ErrorCode.BAD_REQUEST);
    }

    const existingTransaction = await Transaction.findOne({
        user: userId,
        amount,
        status: TransactionStatus.PENDING,
        type: 'TOPUP'
    });

    if (existingTransaction) {
        existingTransaction.when = new Date();
        await existingTransaction.save();

        return {
            _id: existingTransaction._id,
            amount: existingTransaction.amount,
            status: existingTransaction.status
        };
    }

    const transaction = await new Transaction({
        user: userId,
        amount,
        status: TransactionStatus.PENDING,
        type: 'TOPUP',
        when: new Date()
    }).save();

    return {
        _id: transaction._id,
        amount: transaction.amount,
        status: transaction.status
    };
};

const maskAccountNumber = (accountNumber?: string | null) => {
    if (!accountNumber) return undefined;
    if (accountNumber.length <= 4) return accountNumber;
    return accountNumber.replace(/.(?=.{4})/g, '*');
};

type CreatePayoutPayload = {
    amount: number;
    currency?: string;
    bankAbbreviation: string;
    accountNumber: string;
    email: string;
    branch?: string;
    paymentMethod?: string;
    description?: string;
    note?: string;
};

export const createPayoutRequest = async (userId: string, payload: CreatePayoutPayload) => {
    console.log(payload);

    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found', ErrorCode.NOT_FOUND);
        }

        const amount = payload.amount;
        if (!amount || amount <= 0) {
            throw new BadRequestsException('Invalid payout amount', ErrorCode.BAD_REQUEST);
        }

        // Kiểm tra payout PENDING
        const existingPending = await Transaction.findOne({
            user: user._id,
            type: TransactionKind.PAYOUT,
            status: TransactionStatus.PENDING,
            amount: payload.amount
        });

        if (existingPending) {
            throw new BadRequestsException('You already have a pending payout request', ErrorCode.BAD_REQUEST);
        }

        const availableBalance = user.balance || 0;
        if (amount > availableBalance) {
            throw new BadRequestsException('Insufficient balance for payout', ErrorCode.BAD_REQUEST);
        }

        const transaction = await Transaction.create({
            user: user._id,
            type: TransactionKind.PAYOUT,
            direction: TransactionDirection.OUT,
            status: TransactionStatus.PENDING,
            amount,
            currency: payload.currency || 'VND',
            description: payload.description || 'Payout request',
            note: payload.note,
            paymentMethod: payload.paymentMethod || 'BANK_TRANSFER',
            when: new Date(),
            payout: {
                bankAbbreviation: payload.bankAbbreviation,
                accountNumber: payload.accountNumber,
                accountName: payload.email,
                requestedAt: new Date()
            }
        });

        try {
            await fetch(
                process.env.N8N_PAYOUT_WEBHOOK_URL || 'https://poiseidoncoder.app.n8n.cloud/webhook-test/payout',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        transactionId: transaction._id,
                        userId: user._id,
                        userName: user.name,
                        amount: transaction.amount,
                        currency: transaction.currency,
                        bankAbbreviation: transaction.payout?.bankAbbreviation,
                        accountNumber: transaction.payout?.accountNumber,
                        accountName: transaction.payout?.accountName,
                        note: transaction.note,
                        adminEmail: process.env.EMAIL_USER,
                        frontendAdminUri: process.env.FRONTEND_ADMIN_URI + '/withdrawals'
                    })
                }
            );
        } catch (err) {
            console.error('Failed to send payout notification to n8n', err);
        }

        return transaction;
    } catch (error) {
        console.log(error);
    }
};

export const getUserTransactions = async (userId: string) => {
    const transactions = await Transaction.find({ user: userId })
        .sort({ createdAt: -1 })
        .populate('package', 'name price type duration')
        .lean();

    return transactions.map((tx) => ({
        _id: tx._id,
        tid: tx.tid,
        type: tx.type,
        direction: tx.direction,
        amount: tx.amount,
        currency: tx.currency,
        status: tx.status,
        createdAt: tx.createdAt,
        when: tx.when,
        description: tx.description,
        note: tx.note,
        paymentMethod: tx.paymentMethod,
        paidAt: tx.payout?.paidAt,
        payout:
            tx.type === TransactionKind.PAYOUT
                ? {
                      bankAbbreviation: tx.payout?.bankAbbreviation,
                      accountNumber: maskAccountNumber(tx.payout?.accountNumber),
                      accountName: tx.payout?.accountName,
                      branch: tx.payout?.branch
                  }
                : undefined,
        package:
            tx.package && typeof tx.package === 'object'
                ? {
                      name: (tx.package as { name?: string }).name,
                      price: (tx.package as { price?: number }).price,
                      type: (tx.package as { type?: string }).type,
                      duration: (tx.package as { duration?: string }).duration
                  }
                : undefined
    }));
};

export const getTransaction = async (userId: string, packageId: string) => {
    await Transaction.deleteMany({ expiredAt: { $lt: Date.now() }, status: TransactionStatus.PENDING, user: userId });
    const existPackage = await Package.findOne({ _id: packageId, isActive: true });

    if (!existPackage) {
        throw new NotFoundException('Package not found', ErrorCode.NOT_FOUND);
    }
    let transaction = await Transaction.findOne({
        user: userId,
        expiredAt: { $gt: Date.now() },
        package: packageId,
        status: { $ne: TransactionStatus.SUCCESS }
    });

    if (!transaction) {
        transaction = await new Transaction({
            user: userId,
            status: TransactionStatus.PENDING,
            package: packageId
        }).save();
    }

    transaction = await Transaction.findById(transaction._id)
        .select('_id status expiredAt')
        .populate('user', '_id name')
        .populate('package', 'type price ');
    return transaction;
};

export const checkPaid = async (userId: string, transactionId: string) => {
    const transaction = await Transaction.findOne({ user: userId, _id: transactionId })
        .select('status')
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

const getMonthsBetween = (start: Date, end: Date): number => {
    return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
};

export const getDashboardMetricsService = async (year?: string) => {
    const now = new Date();
    const targetYear = year ? parseInt(year) : now.getFullYear();
    const previousYear = targetYear - 1;

    const startOfYear = new Date(targetYear, 0, 1);
    const endOfYear = new Date(targetYear, 11, 31, 23, 59, 59);
    const startOfLastYear = new Date(previousYear, 0, 1);
    const endOfLastYear = new Date(previousYear, 11, 31, 23, 59, 59);

    const startOfMonth =
        targetYear === now.getFullYear() ? new Date(now.getFullYear(), now.getMonth(), 1) : new Date(targetYear, 11, 1);

    const startOfLastMonth =
        targetYear === now.getFullYear()
            ? new Date(now.getFullYear(), now.getMonth() - 1, 1)
            : new Date(targetYear, 10, 1);

    const endOfLastMonth =
        targetYear === now.getFullYear()
            ? new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
            : new Date(targetYear, 10, 31, 23, 59, 59);

    const [totalResult] = await Transaction.aggregate([
        {
            $match: {
                isPaid: true,
                when: { $gte: startOfYear, $lte: endOfYear }
            }
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$amount' }
            }
        }
    ]);

    const [totalLastYear] = await Transaction.aggregate([
        {
            $match: {
                isPaid: true,
                when: { $gte: startOfLastYear, $lte: endOfLastYear }
            }
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$amount' }
            }
        }
    ]);

    const totalRevenue = totalResult?.totalRevenue || 0;
    const totalRevenueLast = totalLastYear?.totalRevenue || 0;
    const totalRevenueChange =
        totalRevenueLast === 0 ? 100 : Math.round(((totalRevenue - totalRevenueLast) / totalRevenueLast) * 100);

    const monthsElapsed = targetYear === now.getFullYear() ? now.getMonth() + 1 : 12;
    const monthlyAverage = monthsElapsed > 0 ? Math.round(totalRevenue / monthsElapsed) : 0;
    const monthlyAverageLast = totalRevenueLast > 0 ? Math.round(totalRevenueLast / 12) : 0;
    const monthlyAverageChange =
        monthlyAverageLast === 0 ? 100 : Math.round(((monthlyAverage - monthlyAverageLast) / monthlyAverageLast) * 100);

    const usersPaid = await Transaction.distinct('user', {
        isPaid: true,
        when: { $gte: startOfYear, $lte: endOfYear }
    });

    const usersPaidLast = await Transaction.distinct('user', {
        isPaid: true,
        when: { $gte: startOfLastYear, $lte: endOfLastYear }
    });

    const arpu = usersPaid.length > 0 ? Math.round(totalRevenue / usersPaid.length) : 0;
    const arpuLast = usersPaidLast.length > 0 ? Math.round(totalRevenueLast / usersPaidLast.length) : 0;
    const arpuChange = arpuLast === 0 ? 100 : Math.round(((arpu - arpuLast) / arpuLast) * 100);

    const [mrrResult] = await Transaction.aggregate([
        {
            $match: {
                isPaid: true,
                when: { $gte: startOfMonth, $lte: endOfYear }
            }
        },
        {
            $group: {
                _id: null,
                monthlyRecurringRevenue: { $sum: '$amount' }
            }
        }
    ]);

    const [mrrLastResult] = await Transaction.aggregate([
        {
            $match: {
                isPaid: true,
                when: { $gte: startOfLastMonth, $lte: endOfLastMonth }
            }
        },
        {
            $group: {
                _id: null,
                monthlyRecurringRevenue: { $sum: '$amount' }
            }
        }
    ]);

    const mrr = mrrResult?.monthlyRecurringRevenue || 0;
    const mrrLast = mrrLastResult?.monthlyRecurringRevenue || 0;
    const mrrChange = mrrLast === 0 ? 100 : Math.round(((mrr - mrrLast) / mrrLast) * 100);

    return {
        totalRevenue,
        totalRevenueChange,
        monthlyAverage,
        monthlyAverageChange,
        arpu,
        arpuChange,
        mrr,
        mrrChange
    };
};

export const getMonthlyRevenueService = async (year?: string) => {
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    const startOfYear = new Date(targetYear, 0, 1);
    const endOfYear = new Date(targetYear, 11, 31, 23, 59, 59);

    const result = await Transaction.aggregate([
        {
            $match: {
                isPaid: true,
                when: { $gte: startOfYear, $lte: endOfYear }
            }
        },
        {
            $group: {
                _id: { $month: '$when' },
                total: { $sum: '$amount' }
            }
        },
        {
            $project: {
                month: '$_id',
                total: 1,
                _id: 0
            }
        }
    ]);

    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => ({
        name: new Date(0, i).toLocaleString('en-US', { month: 'short' }),
        revenue: 0
    }));

    result.forEach((item) => {
        monthlyRevenue[item.month - 1].revenue = item.total;
    });

    return monthlyRevenue;
};

type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';
type RevenueRecord = {
    name: Quarter;
    Basic: number;
    Pro: number;
    Premium: number;
};

export const getQuarterlyRevenueService = async (year: number) => {
    const startDate = startOfYear(new Date(year, 0, 1));
    const endDate = endOfYear(new Date(year, 11, 31));

    const transactions = await Transaction.find({
        isPaid: true,
        when: { $gte: startDate, $lte: endDate }
    })
        .populate('package')
        .exec();

    const quarterlyRevenue: Record<Quarter, RevenueRecord> = {
        Q1: { name: 'Q1', Basic: 0, Pro: 0, Premium: 0 },
        Q2: { name: 'Q2', Basic: 0, Pro: 0, Premium: 0 },
        Q3: { name: 'Q3', Basic: 0, Pro: 0, Premium: 0 },
        Q4: { name: 'Q4', Basic: 0, Pro: 0, Premium: 0 }
    };

    for (const tx of transactions) {
        if (!tx.when || !(tx.when instanceof Date)) continue;

        const month = tx.when.getMonth();
        const quarter: Quarter = month < 3 ? 'Q1' : month < 6 ? 'Q2' : month < 9 ? 'Q3' : 'Q4';

        const populatedPackage =
            tx.package && typeof tx.package === 'object' && 'type' in tx.package
                ? (tx.package as { type: PackageType })
                : null;

        const pkgType = populatedPackage?.type as PackageType | undefined;

        if (pkgType && quarterlyRevenue[quarter][pkgType] !== undefined) {
            quarterlyRevenue[quarter][pkgType] += tx.amount ?? 0;
        }
    }

    return Object.values(quarterlyRevenue);
};

export const buyPackageWithWallet = async (userId: string, packageId: string) => {
    // Validate package
    const existingPackage = await Package.findOne({ _id: packageId, isActive: true });
    if (!existingPackage) {
        throw new NotFoundException('Package not found', ErrorCode.NOT_FOUND);
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
        throw new NotFoundException('User not found', ErrorCode.NOT_FOUND);
    }

    // Check balance
    if (user.balance < existingPackage.price) {
        throw new BadRequestsException(
            `Insufficient balance. You need ${existingPackage.price - user.balance}đ more`,
            ErrorCode.BAD_REQUEST
        );
    }

    // Deduct balance
    user.balance = user.balance - existingPackage.price;

    // Set pro status
    const durationToMonths: Record<string, number> = {
        '3T': 3,
        '6T': 6,
        '1Y': 12
    };
    const months = durationToMonths[existingPackage.duration] || 1;
    const now = new Date();

    user.isPro = true;
    user.proType = existingPackage.type;
    user.proExpiryDate = new Date(now.setMonth(now.getMonth() + months));
    await user.save();

    // Create transaction record for tracking
    const transaction = await new Transaction({
        user: userId,
        package: packageId,
        isPaid: true,
        type: 'PACKAGE',
        amount: existingPackage.price,
        when: new Date()
    }).save();

    console.log('[Wallet Purchase Success] User upgraded with wallet:', {
        userId,
        package: existingPackage.type,
        duration: existingPackage.duration,
        amount: existingPackage.price,
        newBalance: user.balance,
        expiryDate: user.proExpiryDate
    });

    return {
        success: true,
        message: 'Package purchased successfully with wallet!',
        isPro: user.isPro,
        proType: user.proType,
        proExpiryDate: user.proExpiryDate,
        newBalance: user.balance,
        transactionId: transaction._id
    };
};

export const getPendingPayoutRequests = async (userId?: string) => {
    const query: any = {
        type: TransactionKind.PAYOUT,
        status: 'PENDING'
    };

    if (userId) {
        query.user = userId;
    }

    const list = await Transaction.find(query).sort({ createdAt: -1 }).populate('user', 'name email');

    return list.map((t) => ({
        _id: t._id,
        user: t.user,
        type: t.type,
        status: t.status,
        amount: t.amount,
        currency: t.currency,
        description: t.description,
        note: t.note,
        paymentMethod: t.paymentMethod,
        createdAt: t.createdAt,
        payout: {
            bankAbbreviation: t.payout?.bankAbbreviation,
            accountNumber: t.payout?.accountNumber,
            accountName: t.payout?.accountName,
            branch: t.payout?.branch,
            requestedAt: t.payout?.requestedAt,
            paidAt: t.payout?.paidAt,
            rejectReason: t.payout?.rejectReason
        }
    }));
};

export const getUserPayoutHistory = async (userId?: string) => {
    const query: any = {
        type: TransactionKind.PAYOUT,
        status: {
            $in: [TransactionStatus.REJECTED, TransactionStatus.SUCCESS]
        }
    };

    if (userId) {
        query.user = userId;
    }

    const transactions = await Transaction.find(query).sort({ createdAt: -1 }).populate('user', 'name email');

    return transactions.map((t) => ({
        _id: t._id,
        user: t.user,
        type: t.type,
        status: t.status,
        amount: t.amount,
        currency: t.currency,
        description: t.description,
        note: t.note,
        paymentMethod: t.paymentMethod,
        createdAt: t.createdAt,
        payout: {
            bankAbbreviation: t.payout?.bankAbbreviation,
            accountNumber: t.payout?.accountNumber,
            accountName: t.payout?.accountName,
            branch: t.payout?.branch,
            requestedAt: t.payout?.requestedAt,
            paidAt: t.payout?.paidAt,
            paymentRef: t.payout?.paymentRef,
            proofUrl: t.payout?.proofUrl,
            rejectReason: t.payout?.rejectReason,
            processedAt: t.payout?.processedAt
        }
    }));
};

interface RejectPayoutInput {
    transactionId: string;
    adminId: string;
    reason: string;
}
