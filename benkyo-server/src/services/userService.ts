import { z } from 'zod';
import { BadRequestsException } from '~/exceptions/badRequests';
import { ErrorCode } from '~/exceptions/root';

import { User } from '~/schemas';
import { updateUserValidation } from '~/validations/userValidation';

export const updateUserService = async (userId: string, userData: z.infer<typeof updateUserValidation>) => {
    const updateUser = await User.findByIdAndUpdate(userId, userData, { new: true });
    if (!updateUser) {
        throw new BadRequestsException('Something went wrong while updating user', ErrorCode.INTERNAL_SERVER_ERROR);
    }
    return {
        id: updateUser._id,
        username: updateUser.name,
        email: updateUser.email,
        avatar: updateUser.avatar
    };
};
export const listUserAccountsService = async () => {
    const users = await User.find();
    return users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isPro: user.isPro,
        proExpiryDate: user.proExpiryDate,
        proType: user.proType,
        createdAt: user.createdAt,
        role: user.role
    }));
};

export const getAccountStatsService = async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const totalAccounts = await User.countDocuments();
    const newAccountsThisMonth = await User.countDocuments({
        createdAt: { $gte: startOfMonth }
    });

    const newAccountsLastMonth = await User.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });

    const growthPercentage =
        newAccountsLastMonth === 0
            ? 100
            : Math.round(((newAccountsThisMonth - newAccountsLastMonth) / newAccountsLastMonth) * 100);

    return {
        totalAccounts,
        newAccountsThisMonth,
        growthPercentage
    };
};
