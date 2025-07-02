import { User } from '~/schemas';
import { BadRequestsException } from '~/exceptions/badRequests';
import { ErrorCode } from '~/exceptions/root';
import { startOfDay, differenceInCalendarDays } from 'date-fns';

export const updateStudyStreakService = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) throw new BadRequestsException('User not found', ErrorCode.NOT_FOUND);

    if (!user.stats) {
        user.stats = {
            studyStreak: 0,
            longestStudyStreak: 0,
            lastStudyDate: null,
            totalReviews: 0
        };
    }

    const now = new Date();
    const todayStart = startOfDay(now);
    const lastStudyStart = user.stats.lastStudyDate ? startOfDay(new Date(user.stats.lastStudyDate)) : null;

    let updated = false;

    if (!lastStudyStart) {
        user.stats.studyStreak = 1;
        user.stats.longestStudyStreak = 1;
        user.stats.lastStudyDate = now;
        updated = true;
    } else {
        const diff = differenceInCalendarDays(todayStart, lastStudyStart);

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
