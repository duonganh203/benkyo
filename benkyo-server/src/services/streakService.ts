import { User } from '~/schemas';
import { BadRequestsException } from '~/exceptions/badRequests';
import { ErrorCode } from '~/exceptions/root';
import { differenceInCalendarDays } from 'date-fns';

export const updateStudyStreakService = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) throw new BadRequestsException('User not found', ErrorCode.NOT_FOUND);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (!user.stats || !user.stats.lastStudyDate) {
        user.stats = {
            ...user.stats,
            studyStreak: 1,
            longestStudyStreak: 1,
            lastStudyDate: now,
            totalReviews: user.stats?.totalReviews ?? 0
        };
    } else {
        const last = new Date(user.stats.lastStudyDate);
        const diff = differenceInCalendarDays(today, new Date(last.getFullYear(), last.getMonth(), last.getDate()));

        if (diff === 0) {
            return {
                studyStreak: user.stats.studyStreak,
                lastStudyDate: user.stats.lastStudyDate
            };
        } else if (diff === 1) {
            user.stats.studyStreak += 1;
            if (user.stats.studyStreak > user.stats.longestStudyStreak) {
                user.stats.longestStudyStreak = user.stats.studyStreak;
            }
        } else {
            user.stats.studyStreak = 1;
        }
        user.stats.lastStudyDate = now;
    }

    user.markModified('stats');
    await user.save();

    return {
        studyStreak: user.stats.studyStreak,
        lastStudyDate: user.stats.lastStudyDate
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
