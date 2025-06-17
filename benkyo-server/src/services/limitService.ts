import { UserType, GenerationLog, User, Func } from '~/schemas';
import cron from 'node-cron';

export function creditsResetJob() {
    cron.schedule('0 0 * * *', async () => {
        const users = await User.find({});

        for (const user of users) {
            const existing = await GenerationLog.findOne({
                userId: user._id
            });

            if (existing && existing.function === Func.GEN_AI) {
                const tokenLimitAI = getUserCreditLimitAI(user);
                existing.remaining = tokenLimitAI;
                await existing.save();
            }
        }
        console.log(`Resetting daily credits reseted`);
    });
}

export async function checkRemainingCredits(userId: string, func: Func) {
    const remaining = await GenerationLog.findOne({
        userId: userId,
        function: func
    }).select('remaining');
    if (!remaining) {
        return 0;
    }
    return remaining;
}

function getUserCreditLimitAI(user: UserType): number {
    switch (user.proType) {
        case 'Basic':
            return 5;
        case 'Pro':
            return 20;
        case 'Premium':
            return 999999;
        default:
            return 0;
    }
}
