import { User, Card, Revlog, Rating, State, UserDeckState } from '~/schemas';

interface FSRSParams {
    request_retention: number;
    maximum_interval: number;
    w: number[];
    enable_fuzz: boolean;
    enable_short_term: boolean;
    card_limit: number;
    lapses: number;
}

// FSRS v4.5 algorithm implementation
const calculateMemoryState = (
    elapsedDays: number,
    stability: number,
    difficulty: number,
    rating: Rating,
    params: FSRSParams
): { newStability: number; newDifficulty: number } => {
    const { w } = params;

    // Calculate retrievability
    const retrievability = Math.pow(1 + elapsedDays / (9 * stability), -1);

    let newStability: number;
    let newDifficulty: number;

    // Update difficulty first
    switch (rating) {
        case Rating.AGAIN:
            newDifficulty = Math.min(Math.max(difficulty + w[6], 1), 10);
            break;
        case Rating.HARD:
            newDifficulty = Math.min(Math.max(difficulty + w[7], 1), 10);
            break;
        case Rating.GOOD:
            newDifficulty = difficulty;
            break;
        case Rating.EASY:
            newDifficulty = Math.min(Math.max(difficulty + w[8], 1), 10);
            break;
        default:
            newDifficulty = difficulty;
    }

    // Calculate new stability based on rating
    switch (rating) {
        case Rating.AGAIN:
            newStability =
                w[11] *
                Math.pow(newDifficulty, -w[12]) *
                (Math.pow(stability + 1, w[13]) - 1) *
                Math.exp((1 - retrievability) * w[14]);
            break;
        case Rating.HARD:
            newStability =
                stability *
                (1 +
                    Math.exp(w[15]) *
                        (11 - newDifficulty) *
                        Math.pow(stability, -w[16]) *
                        (Math.exp((1 - retrievability) * w[17]) - 1));
            break;
        case Rating.GOOD:
            newStability =
                stability *
                (1 +
                    Math.exp(w[8]) *
                        (11 - newDifficulty) *
                        Math.pow(stability, -w[9]) *
                        (Math.exp((1 - retrievability) * w[10]) - 1));
            break;
        case Rating.EASY:
            newStability =
                stability *
                (1 +
                    Math.exp(w[15]) *
                        (11 - newDifficulty) *
                        Math.pow(stability, -w[16]) *
                        (Math.exp((1 - retrievability) * w[17]) - 1));
            break;
        default:
            newStability = stability;
    }

    return { newStability: Math.max(newStability, 0.01), newDifficulty };
};

const calculateInitialStability = (difficulty: number, rating: Rating, params: FSRSParams): number => {
    const { w } = params;

    switch (rating) {
        case Rating.AGAIN:
            return w[0];
        case Rating.HARD:
            return w[1];
        case Rating.GOOD:
            return w[2];
        case Rating.EASY:
            return w[3];
        default:
            return w[2];
    }
};

const calculateInitialDifficulty = (rating: Rating, params: FSRSParams): number => {
    const { w } = params;

    switch (rating) {
        case Rating.AGAIN:
            return Math.min(Math.max(w[4], 1), 10);
        case Rating.HARD:
            return Math.min(Math.max(w[4] - w[5], 1), 10);
        case Rating.GOOD:
            return Math.min(Math.max(w[4], 1), 10);
        case Rating.EASY:
            return Math.min(Math.max(w[4] - w[5], 1), 10);
        default:
            return Math.min(Math.max(w[4], 1), 10);
    }
};

const calculateInterval = (stability: number, requestedRetention: number, params: FSRSParams): number => {
    const interval = Math.ceil((stability * Math.log(requestedRetention)) / Math.log(0.9));

    if (params.enable_fuzz && interval > 1) {
        const fuzzRange = Math.max(1, Math.floor(interval * 0.05));
        const fuzz = Math.floor(Math.random() * (2 * fuzzRange + 1)) - fuzzRange;
        return Math.max(1, interval + fuzz);
    }

    return Math.max(1, interval);
};

const calculateDue = (interval: number, rating: Rating, params: FSRSParams): number => {
    if (rating === Rating.AGAIN) {
        return params.enable_short_term ? 0 : 1;
    }

    return Math.min(interval, params.maximum_interval);
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
    let difficulty = 0;
    let stability = 0;
    let elapsedDays = 0;
    let lastElapsedDays = 0;

    if (lastReview) {
        state = lastReview.state as State;
        difficulty = lastReview.difficulty;
        stability = lastReview.stability;
        elapsedDays = (now.getTime() - lastReview.review.getTime()) / (24 * 3600 * 1000);
        lastElapsedDays = lastReview.elapsed_days;
    }

    // Determine new state based on current state and rating
    let newState: State;
    switch (state) {
        case State.NEW:
            if (rating === Rating.AGAIN) {
                newState = State.LEARNING;
            } else {
                newState = State.REVIEW;
            }
            break;
        case State.LEARNING:
        case State.RELEARNING:
            if (rating === Rating.AGAIN) {
                newState = state; // Stay in learning/relearning
            } else if (rating === Rating.HARD) {
                newState = state; // Stay in learning/relearning for one more step
            } else {
                newState = State.REVIEW;
            }
            break;
        case State.REVIEW:
            if (rating === Rating.AGAIN) {
                newState = State.RELEARNING;
            } else {
                newState = State.REVIEW;
            }
            break;
        default:
            newState = State.REVIEW;
    }

    let newStability: number;
    let newDifficulty: number;

    if (!lastReview || state === State.NEW) {
        // First review or new card
        newStability = calculateInitialStability(difficulty, rating, fsrsParams);
        newDifficulty = calculateInitialDifficulty(rating, fsrsParams);
    } else {
        // Subsequent reviews
        const memoryState = calculateMemoryState(elapsedDays, stability, difficulty, rating, fsrsParams);
        newStability = memoryState.newStability;
        newDifficulty = memoryState.newDifficulty;
    }

    // Calculate scheduled days
    let scheduledDays: number;

    if (newState === State.LEARNING || newState === State.RELEARNING) {
        // Learning/relearning cards have fixed intervals
        if (rating === Rating.AGAIN) {
            scheduledDays = fsrsParams.enable_short_term ? 0 : 1;
        } else if (rating === Rating.HARD) {
            scheduledDays = 1;
        } else {
            scheduledDays = 1;
        }
    } else {
        // Review cards use FSRS interval calculation
        const interval = calculateInterval(newStability, fsrsParams.request_retention, fsrsParams);
        scheduledDays = calculateDue(interval, rating, fsrsParams);
    }

    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + scheduledDays);

    // Create new revlog entry
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

    // Update user stats
    await User.findByIdAndUpdate(userId, {
        $inc: { 'stats.totalReviews': 1 },
        $set: { 'stats.lastStudyDate': now }
    });

    // Update deck stats
    const card = await Card.findById(cardId);
    if (card) {
        const deckId = card.deck;
        const updateObj: Record<string, number> = {};
        const dateFields = { lastStudied: now };

        // Decrement old state count
        if (lastReview) {
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
        } else {
            updateObj['stats.newCards'] = -1;
        }

        // Increment new state count
        switch (newState) {
            case State.LEARNING:
            case State.RELEARNING:
                updateObj['stats.learningCards'] = (updateObj['stats.learningCards'] || 0) + 1;
                break;
            case State.REVIEW:
                updateObj['stats.reviewCards'] = (updateObj['stats.reviewCards'] || 0) + 1;
                break;
        }

        await UserDeckState.findOneAndUpdate(
            { user: userId, deck: deckId },
            {
                $inc: updateObj,
                $set: dateFields
            },
            { new: true, upsert: true }
        );
    }

    // Handle lapses
    if (rating === Rating.AGAIN) {
        const lapses = await Revlog.countDocuments({
            user: userId,
            card: cardId,
            grade: Rating.AGAIN,
            deleted: false
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
    const cardIds = cards.map((card: any) => card._id);

    const latestRevlogs = await Revlog.aggregate([
        {
            $match: {
                user: userId,
                card: { $in: cardIds.map((id: any) => id.toString()) },
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
    latestRevlogs.forEach((item: any) => {
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

    const userDeckState = await UserDeckState.findOne({
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

    const updateObj: Record<string, any> = {};

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

export const getUserProgressService = async (userId: string) => {
    const totalReviews = await Revlog.countDocuments({ user: userId });

    const userDecks = await UserDeckState.find({ user: userId });

    let totalFlashcards = 0,
        masteredFlashcards = 0,
        studyingFlashcards = 0,
        newFlashcards = 0;
    userDecks.forEach((deck: any) => {
        totalFlashcards += deck.stats?.totalCards || 0;
        masteredFlashcards += deck.stats?.reviewCards || 0;
        studyingFlashcards += deck.stats?.learningCards || 0;
        newFlashcards += deck.stats?.newCards || 0;
    });

    const completionRate = totalFlashcards > 0 ? (masteredFlashcards / totalFlashcards) * 100 : 0;

    const recommendedDecks = await UserDeckState.find({
        user: userId,
        lastStudied: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).populate('deck', 'name description');

    return {
        totalReviews,
        totalFlashcards,
        masteredFlashcards,
        studyingFlashcards,
        newFlashcards,
        completionRate,
        recommendedDecks
    };
};

export const skipCardService = async (userId: string, cardId: string) => {
    const revlog = await Revlog.findOne({ user: userId, card: cardId, deleted: false }, {}, { sort: { review: -1 } });
    const now = new Date();
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 100000);

    if (!revlog) {
        const newRevlog = new Revlog({
            user: userId,
            card: cardId,
            grade: Rating.EASY,
            state: State.REVIEW,
            due: dueDate,
            stability: 100,
            difficulty: 1,
            elapsed_days: 0,
            last_elapsed_days: 0,
            scheduled_days: 1,
            review: now,
            duration: 0,
            deleted: false,
            created_at: now
        });
        await newRevlog.save();
        return 'success';
    }

    const newRevlog = new Revlog({
        user: userId,
        card: cardId,
        grade: Rating.EASY,
        state: State.REVIEW,
        due: dueDate,
        stability: revlog.stability,
        difficulty: revlog.difficulty,
        elapsed_days: revlog.elapsed_days,
        last_elapsed_days: revlog.last_elapsed_days,
        scheduled_days: 1,
        review: now,
        duration: 0,
        deleted: false,
        created_at: now
    });
    await newRevlog.save();
    return 'success';
};
