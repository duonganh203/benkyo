import { User } from '~/schemas';
import { BadRequestsException } from '~/exceptions/badRequests';
import { ErrorCode } from '~/exceptions/root';

export const updateLoginStreakService = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new BadRequestsException('User not found', ErrorCode.NOT_FOUND);
    }

    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));

    const lastLoginDate = user.lastLoginDate ? new Date(user.lastLoginDate) : null;
    if (lastLoginDate) lastLoginDate.setHours(0, 0, 0, 0);

    if (!lastLoginDate) {
        user.loginStreak = 1;
    } else if (lastLoginDate.getTime() === today.getTime()) {
        return {
            loginStreak: user.loginStreak,
            lastLoginDate: user.lastLoginDate
        };
    } else {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastLoginDate.getTime() === yesterday.getTime()) {
            user.loginStreak += 1;
        } else {
            user.loginStreak = 1;
        }
    }

    user.lastLoginDate = new Date();
    await user.save();

    return {
        loginStreak: user.loginStreak,
        lastLoginDate: user.lastLoginDate
    };
};

export const getLoginStreakService = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new BadRequestsException('User not found', ErrorCode.NOT_FOUND);
    }

    return {
        loginStreak: user.loginStreak,
        lastLoginDate: user.lastLoginDate
    };
};
