import { User, Card, Revlog, Rating, State } from '~/schemas';
import mongoose from 'mongoose';

interface FSRSParams {
    request_retention: number;
    maximum_interval: number;
    w: number[];
    enable_fuzz: boolean;
    enable_short_term: boolean;
    card_limit: number;
    lapses: number;
}

const calculateRetrievability = (stability: number, elapsedDays: number): number => {
    return Math.exp((Math.log(0.9) * elapsedDays) / stability);
};

const calculateStability = (
    stability: number,
    difficulty: number,
    retrievability: number,
    rating: Rating,
    params: FSRSParams
): number => {
    const { w } = params;
    let stabilityFactor, difficultyFactor;

    switch (rating) {
        case Rating.AGAIN:
            stabilityFactor = w[0];
            difficultyFactor = 1 - w[1] * (1 - retrievability);
            break;
        case Rating.HARD:
            stabilityFactor = w[2];
            difficultyFactor = 1 + w[3] * (retrievability - 1);
            break;
        case Rating.GOOD:
            stabilityFactor = w[4];
            difficultyFactor = 1 + w[5] * (retrievability - 1);
            break;
        case Rating.EASY:
            stabilityFactor = w[6];
            difficultyFactor = 1 + w[7] * (retrievability - 1);
            break;
        default:
            stabilityFactor = w[4];
            difficultyFactor = 1;
    }

    return stability * stabilityFactor * difficultyFactor;
};

const calculateDifficulty = (previousDifficulty: number, rating: Rating, params: FSRSParams): number => {
    const { w } = params;
    let newDifficulty = previousDifficulty;

    switch (rating) {
        case Rating.AGAIN:
            newDifficulty = previousDifficulty + w[10];
            break;
        case Rating.HARD:
            newDifficulty = previousDifficulty + w[10] / 2;
            break;
        case Rating.GOOD:
            break;
        case Rating.EASY:
            newDifficulty = previousDifficulty - w[9];
            break;
    }

    return Math.min(Math.max(newDifficulty, w[11]), w[12]);
};

const calculateInterval = (stability: number, targetRetention: number, rating: Rating, params: FSRSParams): number => {
    let retentionFactor;
    switch (rating) {
        case Rating.HARD:
            retentionFactor = 0.85;
            break;
        case Rating.GOOD:
            retentionFactor = 0.9;
            break;
        case Rating.EASY:
            retentionFactor = 0.95;
            break;
        default:
            retentionFactor = targetRetention;
    }

    const interval = Math.ceil((stability * Math.log(targetRetention)) / Math.log(retentionFactor));

    if (params.enable_fuzz && interval > 1) {
        const fuzz = 1 + (Math.random() * 0.1 - 0.05);
        return Math.round(interval * fuzz);
    }

    return Math.abs(interval);
};

export const processReview = async (
    userId: string,
    cardId: string,
    rating: Rating,
    reviewTimeSeconds: number
): Promise<{ state: State; due: Date; interval: number }> => {
    const user = await User.findById(userId);
    if (!user || !user.fsrsParams) {
        throw new Error('User or FSRS parameters not found');
    }

    const fsrsParams = user.fsrsParams as unknown as FSRSParams;

    const lastReview = await Revlog.findOne(
        { user: userId, card: cardId, deleted: false },
        {},
        { sort: { review: -1 } }
    );

    const now = new Date();
    let state = State.NEW;
    let difficulty = fsrsParams.w[8];
    let stability = 0;
    let elapsedDays = 0;
    let lastElapsedDays = 0;

    if (lastReview) {
        state = lastReview.state as State;
        difficulty = lastReview.difficulty;
        stability = lastReview.stability;

        elapsedDays = (now.getTime() - lastReview.review.getTime()) / (24 * 3600 * 1000);
        lastElapsedDays = lastReview.elapsed_days;

        if (difficulty <= 0) {
            difficulty = fsrsParams.w[8];
        }
    }

    let newState: State;

    switch (rating) {
        case Rating.AGAIN:
            if (state === State.NEW) {
                newState = State.LEARNING;
            } else if (state === State.REVIEW) {
                newState = State.RELEARNING;
            } else {
                newState = state;
            }
            break;

        case Rating.HARD:
            if (state === State.NEW || state === State.LEARNING) {
                newState = State.LEARNING;
            } else if (state === State.RELEARNING) {
                newState = State.RELEARNING;
            } else {
                newState = State.REVIEW;
            }
            break;

        case Rating.GOOD:
            if (state === State.NEW || state === State.LEARNING || state === State.RELEARNING) {
                newState = State.REVIEW;
            } else {
                newState = State.REVIEW;
            }
            break;

        case Rating.EASY:
            newState = State.REVIEW;
            break;

        default:
            newState = state;
    }

    const retrievability = lastReview ? calculateRetrievability(stability, elapsedDays) : fsrsParams.w[13];

    let newStability: number;
    if (!lastReview || rating === Rating.AGAIN || state === State.NEW) {
        switch (rating) {
            case Rating.AGAIN:
                newStability = fsrsParams.w[0];
                break;
            case Rating.HARD:
                newStability = fsrsParams.w[2];
                break;
            case Rating.GOOD:
                newStability = fsrsParams.w[4];
                break;
            case Rating.EASY:
                newStability = fsrsParams.w[6];
                break;
            default:
                newStability = fsrsParams.w[4];
        }
    } else {
        newStability = calculateStability(stability, difficulty, retrievability, rating, fsrsParams);
    }

    const newDifficulty = calculateDifficulty(difficulty, rating, fsrsParams);

    let scheduledDays: number;

    if (rating === Rating.AGAIN) {
        if (fsrsParams.enable_short_term) {
            scheduledDays = 0;
        } else {
            scheduledDays = 1;
        }
    } else if ((state === State.LEARNING || state === State.RELEARNING) && rating !== Rating.EASY) {
        scheduledDays = rating === Rating.HARD ? 1 : 1;
    } else {
        scheduledDays = calculateInterval(newStability, fsrsParams.request_retention, rating, fsrsParams);
    }

    scheduledDays = Math.min(scheduledDays, fsrsParams.maximum_interval);

    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + scheduledDays);

    const newRevlog = new Revlog({
        user: userId,
        card: cardId,
        grade: rating,
        state: newState,
        due: dueDate,
        stability: newStability,
        difficulty: newDifficulty,
        elapsed_days: elapsedDays,
        last_elapsed_days: lastElapsedDays,
        scheduled_days: scheduledDays,
        review: now,
        duration: reviewTimeSeconds,
        deleted: false,
        created_at: now
    });

    await newRevlog.save();

    await User.findByIdAndUpdate(userId, {
        $inc: { 'stats.totalReviews': 1 },
        $set: { 'stats.lastStudyDate': now }
    });

    const card = await Card.findById(cardId);
    if (card) {
        const deckId = card.deck;

        if (lastReview) {
            const updateObj: any = {
                'stats.newCards': 0,
                'stats.learningCards': 0,
                'stats.reviewCards': 0
            };
            const dateFields = { lastStudied: now };

            switch (state) {
                case State.NEW:
                    updateObj['stats.newCards'] = -1;
                    break;
                case State.LEARNING:
                case State.RELEARNING:
                    updateObj['stats.learningCards'] = -1;
                    break;
                case State.REVIEW:
                    updateObj['stats.reviewCards'] = -1;
                    break;
            }

            switch (newState) {
                case State.NEW:
                    updateObj['stats.newCards'] = updateObj['stats.newCards'] + 1;
                    break;
                case State.LEARNING:
                case State.RELEARNING:
                    updateObj['stats.learningCards'] = updateObj['stats.learningCards'] + 1;
                    break;
                case State.REVIEW:
                    updateObj['stats.reviewCards'] = updateObj['stats.reviewCards'] + 1;
                    break;
            }

            await mongoose.model('UserDeckState').findOneAndUpdate(
                { user: userId, deck: deckId },
                {
                    $inc: updateObj,
                    $set: dateFields
                }
            );
        } else {
            const updateObj: any = { 'stats.newCards': -1 };
            const dateFields = { lastStudied: now };

            switch (newState) {
                case State.LEARNING:
                case State.RELEARNING:
                    updateObj['stats.learningCards'] = 1;
                    break;
                case State.REVIEW:
                    updateObj['stats.reviewCards'] = 1;
                    break;
            }

            await mongoose.model('UserDeckState').findOneAndUpdate(
                { user: userId, deck: deckId },
                {
                    $inc: updateObj,
                    $set: dateFields
                }
            );
        }
    }

    if (rating === Rating.AGAIN) {
        const lapses = await Revlog.countDocuments({
            user: userId,
            card: cardId,
            grade: Rating.AGAIN
        });

        if (lapses >= fsrsParams.lapses) {
            newState = State.NEW;
        }
    }

    return {
        state: newState,
        due: dueDate,
        interval: scheduledDays
    };
};

export const getDueCards = async (userId: string, deckId: string) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const cards = await Card.find({ deck: deckId });
    const cardIds = cards.map((card) => card._id);

    const latestRevlogs = await Revlog.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(userId),
                card: { $in: cardIds.map((id) => new mongoose.Types.ObjectId(id.toString())) },
                deleted: false
            }
        },
        {
            $sort: { review: -1 }
        },
        {
            $group: {
                _id: '$card',
                latestRevlog: { $first: '$$ROOT' }
            }
        }
    ]);

    const revlogMap = new Map();
    latestRevlogs.forEach((item) => {
        revlogMap.set(item._id.toString(), item.latestRevlog);
    });

    const dueCardIds: string[] = [];
    const newCardIds: string[] = [];

    for (const card of cards) {
        const cardId = card._id.toString();
        const revlog = revlogMap.get(cardId);

        if (revlog) {
            if (new Date(revlog.due) <= now) {
                dueCardIds.push(cardId);
            }
        } else {
            newCardIds.push(cardId);
        }
    }

    const userDeckState = await mongoose.model('UserDeckState').findOne({
        user: userId,
        deck: deckId
    });

    const newCardsPerDay = userDeckState?.newCardsPerDay || 20;
    const reviewsPerDay = userDeckState?.reviewsPerDay || 100;

    const newCardsSeenToday = await Revlog.countDocuments({
        user: userId,
        card: { $in: cardIds },
        state: { $ne: State.NEW },
        review: { $gte: today },
        deleted: false
    });

    const newCardsRemaining = Math.max(0, newCardsPerDay - newCardsSeenToday);

    const limitedNewCards = newCardIds.slice(0, newCardsRemaining);
    const limitedDueCards = dueCardIds.slice(0, reviewsPerDay - limitedNewCards.length);

    const allCards = await Card.find({ _id: { $in: [...limitedDueCards, ...limitedNewCards] } });

    return allCards;
};

export const updateFSRSParams = async (userId: string, params: Partial<FSRSParams>): Promise<FSRSParams> => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    const updateObj: any = {};

    for (const [key, value] of Object.entries(params)) {
        updateObj[`fsrsParams.${key}`] = value;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateObj }, { new: true });

    return updatedUser!.fsrsParams as unknown as FSRSParams;
};

export const getUserFSRSParams = async (userId: string): Promise<FSRSParams> => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    return user.fsrsParams as unknown as FSRSParams;
};
