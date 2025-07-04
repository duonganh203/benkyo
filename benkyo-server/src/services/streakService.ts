import { User } from '~/schemas';
import { BadRequestsException } from '~/exceptions/badRequests';
import { ErrorCode } from '~/exceptions/root';
import { startOfDay, differenceInCalendarDays } from 'date-fns';

export const updateStudyStreakService = async (userId: string) => {
    const user = await User.findById(userId, 'stats');

    if (!user) {
        throw new BadRequestsException('User not found', ErrorCode.NOT_FOUND);
    }

    const now = new Date();
    const todayStart = startOfDay(now);
    const stats = user.stats || {
        studyStreak: 0,
        longestStudyStreak: 0,
        lastStudyDate: null,
        totalReviews: 0
    };

    const lastStudyStart = stats.lastStudyDate ? startOfDay(new Date(stats.lastStudyDate)) : null;

    let updated = false;
    let newStudyStreak = stats.studyStreak || 0;
    let newLongestStreak = stats.longestStudyStreak || 0;

    if (!lastStudyStart) {
        newStudyStreak = 1;
        newLongestStreak = 1;
        updated = true;
    } else {
        const diff = differenceInCalendarDays(todayStart, lastStudyStart);

        if (diff === 1) {
            newStudyStreak += 1;
            newLongestStreak = Math.max(newLongestStreak, newStudyStreak);
            updated = true;
        } else if (diff > 1) {
            newStudyStreak = 1;
            updated = true;
        }
    }

    await User.updateOne(
        { _id: userId },
        {
            $set: {
                'stats.studyStreak': newStudyStreak,
                'stats.longestStudyStreak': newLongestStreak,
                'stats.lastStudyDate': now
            }
        }
    );

    return {
        studyStreak: newStudyStreak,
        lastStudyDate: now,
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
