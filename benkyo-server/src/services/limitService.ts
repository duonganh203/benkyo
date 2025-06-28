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
        console.log('Daily credits reset');
    });
}

export async function getRemainingCredits(userId: string, func: string) {
    const remaining = await GenerationLog.findOne({
        userId: userId,
        function: func
    }).select('remaining');
    if (!remaining) {
        return 0;
    }
    return remaining.remaining;
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

export async function deductUserCredit(userId: string, func: string) {
    console.log(`Deducting credit for user ${userId} for function ${func}`);
    const log = await GenerationLog.findOne({
        userId,
        function: func
    }).select('remaining');
    if (log) {
        log.remaining -= 1;
        await log.save();
    }
}

export async function addCreditFromNewUser(userId: string) {
    const logAI = await GenerationLog.findOne({
        userId,
        function: Func.GEN_AI
    });
    if (!logAI) {
        const logAINew = new GenerationLog({
            userId,
            function: Func.GEN_AI,
            remaining: getUserCreditLimitAI(user)
        });
        await logAINew.save();
    }
}
