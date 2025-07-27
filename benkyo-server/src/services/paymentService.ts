import 'dotenv/config';
import { NotFoundException } from '~/exceptions/notFound';
import { ErrorCode } from '~/exceptions/root';
import { TransactionType, Transaction, User, Package, PackageType } from '~/schemas';
import { startOfYear, endOfYear } from 'date-fns';
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
        console.error('[Transaction Error] User ID not found in description:', {
            description,
            transactionData
        });
        return;
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

    const existedUser = await User.findById(userId);
    if (!existedUser) {
        console.error('[Transaction Error] User not found:', {
            userId,
            description
        });
        return;
    }

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

    const existedTransaction = await Transaction.findOne({ user: userId });
    if (!existedTransaction) {
        console.error('[Transaction Error] Transaction not found for user:', {
            userId,
            description
        });
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

    console.log('[Transaction Success] User upgraded successfully:', {
        userId,
        package: existedPackage.type,
        duration: existedPackage.duration,
        expiryDate: existedUser.proExpiryDate
    });

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
