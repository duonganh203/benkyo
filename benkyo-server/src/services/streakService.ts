import { User } from '~/schemas';
import { BadRequestsException } from '~/exceptions/badRequests';
import { ErrorCode } from '~/exceptions/root';
import { startOfDay, differenceInCalendarDays } from 'date-fns';

export const updateStudyStreakService = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) throw new BadRequestsException('User not found', ErrorCode.NOT_FOUND);

    const now = new Date();

    if (!user.stats) {
        user.stats = {
            studyStreak: 1,
            longestStudyStreak: 1,
            lastStudyDate: now,
            totalReviews: 0
        };
    }

    const todayStart = startOfDay(now);
    const last = user.stats.lastStudyDate ? startOfDay(new Date(user.stats.lastStudyDate)) : null;

    let updated = false;

    if (!last) {
        user.stats = {
            ...user.stats,
            studyStreak: 1,
            longestStudyStreak: 1,
            lastStudyDate: now,
            totalReviews: user.stats.totalReviews ?? 0
        };
        updated = true;
    } else {
        const diff = differenceInCalendarDays(todayStart, last);

        if (diff === 1) {
            user.stats.studyStreak += 1;
            user.stats.longestStudyStreak = Math.max(user.stats.longestStudyStreak, user.stats.studyStreak);
            updated = true;
        } else if (diff > 1) {
            user.stats.studyStreak = 1;
            updated = true;
        }
        user.stats.lastStudyDate = now;
    }

    user.markModified('stats');
    await user.save();

    return {
        studyStreak: user.stats.studyStreak,
        lastStudyDate: user.stats.lastStudyDate,
        updated
    };
};

export const getStudyStreakService = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new BadRequestsException('User not found', ErrorCode.NOT_FOUND);
    }

    return {
        studyStreak: user.stats?.studyStreak ?? 0,
        lastStudyDate: user.stats?.lastStudyDate ?? null
    };
};

export const getTopLongestStudyStreakService = async (limit = 10) => {
    return User.find({ 'stats.longestStudyStreak': { $gt: 0 } })
        .sort({ 'stats.longestStudyStreak': -1, _id: 1 })
        .limit(limit)
        .select('name avatar stats.longestStudyStreak')
        .lean();
};
