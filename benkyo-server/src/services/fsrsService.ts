import { User, Card, Revlog, Rating, State, UserDeckState, Deck } from '~/schemas';
import mongoose from 'mongoose';
import { NotFoundException } from '~/exceptions/notFound';
import { ErrorCode } from '~/exceptions/root';
import { updateStudyStreakService } from './streakService';

interface FSRSParams {
    request_retention: number;
    maximum_interval: number;
    w: number[];
    enable_fuzz: boolean;
    enable_short_term: boolean;
    card_limit: number;
    lapses: number;
}

const FSRS_CONSTANTS = {
    F: 19 / 81,
    C: -0.5,
    MIN_DIFFICULTY: 1.0,
    MAX_DIFFICULTY: 10.0,
    INITIAL_RETRIEVABILITY: 1.0
} as const;

const calculateRetrievability = (elapsedDays: number, stability: number): number => {
    const { F, C } = FSRS_CONSTANTS;

    if (stability <= 0) return 0;
    if (elapsedDays <= 0) return FSRS_CONSTANTS.INITIAL_RETRIEVABILITY;

    return Math.pow(1 + F * (elapsedDays / stability), C);
};

const calculateInterval = (stability: number, desiredRetention: number): number => {
    const { F, C } = FSRS_CONSTANTS;

    if (stability <= 0) return 1;

    const interval = (stability / F) * (Math.pow(desiredRetention, 1 / C) - 1);
    return Math.max(Math.round(interval), 1);
};

const calculateInitialStability = (grade: Rating, params: FSRSParams): number => {
    const { w } = params;

    switch (grade) {
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

const calculateInitialDifficulty = (grade: Rating, params: FSRSParams): number => {
    const { w } = params;
    const gradeValue = grade as number;

    const difficulty = w[4] - Math.exp(w[5] * (gradeValue - 1)) + 1;
    return Math.max(FSRS_CONSTANTS.MIN_DIFFICULTY, Math.min(FSRS_CONSTANTS.MAX_DIFFICULTY, difficulty));
};

const calculateStabilityOnSuccess = (
    currentDifficulty: number,
    currentStability: number,
    retrievability: number,
    grade: Rating,
    params: FSRSParams
): number => {
    const { w } = params;

    const difficultyFactor = 11 - currentDifficulty;
    const stabilityFactor = Math.pow(currentStability, -w[9]);
    const retrievabilityFactor = Math.exp(w[10] * (1 - retrievability)) - 1;
    const hardPenalty = grade === Rating.HARD ? w[15] : 1.0;
    const easyBonus = grade === Rating.EASY ? w[16] : 1.0;
    const growthMultiplier = Math.exp(w[8]);

    const alpha =
        1 + difficultyFactor * stabilityFactor * retrievabilityFactor * hardPenalty * easyBonus * growthMultiplier;

    return currentStability * alpha;
};

const calculateStabilityOnFailure = (
    currentDifficulty: number,
    currentStability: number,
    retrievability: number,
    params: FSRSParams
): number => {
    const { w } = params;

    const difficultyFactor = Math.pow(currentDifficulty, -w[12]);
    const stabilityFactor = Math.pow(currentStability + 1, w[13]) - 1;
    const retrievabilityFactor = Math.exp(w[14] * (1 - retrievability));
    const baseFactor = w[11];

    const newStability = difficultyFactor * stabilityFactor * retrievabilityFactor * baseFactor;

    return Math.min(newStability, currentStability);
};

const calculateNewDifficulty = (currentDifficulty: number, grade: Rating, params: FSRSParams): number => {
    const { w } = params;
    const gradeValue = grade as number;

    const difficultyChange = -w[6] * (gradeValue - 3);
    const scalingFactor = (FSRS_CONSTANTS.MAX_DIFFICULTY - currentDifficulty) / 9;
    const adjustedDifficulty = currentDifficulty + difficultyChange * scalingFactor;
    const easyTargetDifficulty = calculateInitialDifficulty(Rating.EASY, params);
    const newDifficulty = w[7] * easyTargetDifficulty + (1 - w[7]) * adjustedDifficulty;

    return Math.max(FSRS_CONSTANTS.MIN_DIFFICULTY, Math.min(FSRS_CONSTANTS.MAX_DIFFICULTY, newDifficulty));
};

const getNextState = (currentState: State, grade: Rating): State => {
    switch (grade) {
        case Rating.AGAIN:
            if (currentState === State.NEW) {
                return State.LEARNING;
            } else if (currentState === State.REVIEW) {
                return State.RELEARNING;
            } else {
                return currentState;
            }

        case Rating.HARD:
            if (currentState === State.NEW || currentState === State.LEARNING) {
                return State.LEARNING;
            } else if (currentState === State.RELEARNING) {
                return State.RELEARNING;
            } else {
                return State.REVIEW;
            }

        case Rating.GOOD:
            return State.REVIEW;

        case Rating.EASY:
            return State.REVIEW;

        default:
            return currentState;
    }
};

const applyFuzzing = (interval: number, enableFuzz: boolean): number => {
    if (!enableFuzz || interval <= 1) {
        return interval;
    }

    const fuzzRange = 0.05;
    const fuzzFactor = 1 + (Math.random() * 2 - 1) * fuzzRange;

    return Math.round(interval * fuzzFactor);
};

export const processReview = async (
    userId: string,
    cardId: string,
    rating: Rating,
    reviewTimeSeconds: number
): Promise<{ state: State; due: Date; interval: number }> => {
    const user = await User.findById(userId);
    if (!user || !user.fsrsParams) {
        throw new NotFoundException('User or FSRS parameters not found', ErrorCode.NOT_FOUND);
    }

    // Get the card to find its deck
    const card = await Card.findById(cardId);
    if (!card) {
        throw new NotFoundException('Card not found', ErrorCode.NOT_FOUND);
    }

    // Get deck to check for deck-specific FSRS parameters
    const deck = await Deck.findById(card.deck);
    if (!deck) {
        throw new NotFoundException('Deck not found', ErrorCode.NOT_FOUND);
    }

    // Prefer deck FSRS parameters over user parameters
    const fsrsParams = (deck.fsrsParams as unknown as FSRSParams) || (user.fsrsParams as unknown as FSRSParams);
    const now = new Date();

    const lastReview = await Revlog.findOne(
        { user: userId, card: cardId, deleted: false },
        {},
        { sort: { review: -1 } }
    );

    let currentState = State.NEW;
    let currentDifficulty = 0;
    let currentStability = 0;
    let elapsedDays = 0;
    let lastElapsedDays = 0;

    if (lastReview) {
        currentState = lastReview.state as State;
        currentDifficulty = lastReview.difficulty;
        currentStability = lastReview.stability;
        elapsedDays = (now.getTime() - lastReview.review.getTime()) / (24 * 3600 * 1000);
        lastElapsedDays = lastReview.elapsed_days;
    }

    let retrievability: number;
    if (!lastReview || currentState === State.NEW) {
        retrievability = FSRS_CONSTANTS.INITIAL_RETRIEVABILITY;
    } else {
        retrievability = calculateRetrievability(elapsedDays, currentStability);
    }

    let newStability: number;
    if (!lastReview || currentState === State.NEW) {
        newStability = calculateInitialStability(rating, fsrsParams);
    } else if (rating === Rating.AGAIN) {
        newStability = calculateStabilityOnFailure(currentDifficulty, currentStability, retrievability, fsrsParams);
    } else {
        newStability = calculateStabilityOnSuccess(
            currentDifficulty,
            currentStability,
            retrievability,
            rating,
            fsrsParams
        );
    }

    let newDifficulty: number;
    if (!lastReview || currentState === State.NEW) {
        newDifficulty = calculateInitialDifficulty(rating, fsrsParams);
    } else {
        newDifficulty = calculateNewDifficulty(currentDifficulty, rating, fsrsParams);
    }

    const newState = getNextState(currentState, rating);

    let scheduledDays: number;
    if (rating === Rating.AGAIN) {
        scheduledDays = fsrsParams.enable_short_term ? 0 : 1;
    } else if ((currentState === State.LEARNING || currentState === State.RELEARNING) && rating !== Rating.EASY) {
        scheduledDays = rating === Rating.HARD ? 1 : 1;
    } else {
        scheduledDays = calculateInterval(newStability, fsrsParams.request_retention);
        scheduledDays = applyFuzzing(scheduledDays, fsrsParams.enable_fuzz);
    }

    scheduledDays = Math.min(scheduledDays, fsrsParams.maximum_interval);

    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + scheduledDays);

    // Create new review log entry
    const newRevlog = new Revlog({
        user: userId,
        card: cardId,
        grade: rating as number,
        state: newState as number,
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

    await updateStudyStreakService(userId);

    // Update user statistics
    await User.findByIdAndUpdate(userId, {
        $inc: { 'stats.totalReviews': 1 },
        $set: { 'stats.lastStudyDate': now }
    });

    // Update deck statistics
    await updateDeckStatistics(userId, card.deck.toString(), currentState, newState, now);

    // Check for lapse threshold
    if (rating === Rating.AGAIN) {
        const lapseCount = await Revlog.countDocuments({
            user: userId,
            card: cardId,
            grade: Rating.AGAIN,
            deleted: false
        });

        if (lapseCount >= fsrsParams.lapses) {
            // Reset card to NEW state if too many lapses
            return {
                state: State.NEW,
                due: dueDate,
                interval: scheduledDays
            };
        }
    }

    return {
        state: newState,
        due: dueDate,
        interval: scheduledDays
    };
};

/**
 * Update deck statistics after a review
 * Maintains accurate counts of cards in different states
 */
const updateDeckStatistics = async (
    userId: string,
    deckId: string,
    oldState: State,
    newState: State,
    reviewDate: Date
): Promise<void> => {
    const updateObj: any = {};
    const setObj: any = { lastStudied: reviewDate };

    // Decrement old state count
    switch (oldState) {
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

    // Increment new state count
    switch (newState) {
        case State.NEW:
            updateObj['stats.newCards'] = (updateObj['stats.newCards'] || 0) + 1;
            break;
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
            $set: setObj
        },
        { upsert: true, new: true }
    );
};

// Export existing functions (keeping API compatibility)
export const getDueCards = async (userId: string, deckId: string) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new NotFoundException('User not found', ErrorCode.NOT_FOUND);
    }

    // Get deck to check for deck-specific FSRS parameters
    const deck = await Deck.findById(deckId);
    if (!deck) {
        throw new NotFoundException('Deck not found', ErrorCode.NOT_FOUND);
    }

    // Prefer deck FSRS parameters over user parameters
    const fsrsParams = (deck.fsrsParams as unknown as FSRSParams) || (user.fsrsParams as unknown as FSRSParams);

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

    const userDeckState = await UserDeckState.findOne({
        user: userId,
        deck: deckId
    });

    // Use deck FSRS parameters if available, otherwise fall back to user deck state or defaults
    const newCardsPerDay = fsrsParams.card_limit || 20;
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
        throw new NotFoundException('User not found', ErrorCode.NOT_FOUND);
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
        throw new NotFoundException('User not found', ErrorCode.NOT_FOUND);
    }

    return user.fsrsParams as unknown as FSRSParams;
};

export const getUserProgressService = async (userId: string) => {
    const totalReviews = await Revlog.countDocuments({ user: userId, deleted: false });

    const userDecks = await UserDeckState.find({ user: userId });

    let totalFlashcards = 0,
        masteredFlashcards = 0,
        studyingFlashcards = 0,
        newFlashcards = 0;
    userDecks.forEach((deck) => {
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
    const user = await User.findById(userId);
    if (!user || !user.fsrsParams) {
        throw new NotFoundException('User or FSRS parameters not found', ErrorCode.NOT_FOUND);
    }

    // Get the card to find its deck
    const card = await Card.findById(cardId);
    if (!card) {
        throw new NotFoundException('Card not found', ErrorCode.NOT_FOUND);
    }

    // Get deck to check for deck-specific FSRS parameters
    const deck = await Deck.findById(card.deck);
    if (!deck) {
        throw new NotFoundException('Deck not found', ErrorCode.NOT_FOUND);
    }

    // Prefer deck FSRS parameters over user parameters
    const fsrsParams = (deck.fsrsParams as unknown as FSRSParams) || (user.fsrsParams as unknown as FSRSParams);
    const now = new Date();

    // Set due date far in the future (effectively skipping)
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + fsrsParams.maximum_interval);

    const revlog = await Revlog.findOne(
        {
            user: userId,
            card: cardId,
            deleted: false
        },
        {},
        { sort: { review: -1 } }
    );

    let stability = 365; // High stability for skipped cards
    let difficulty: number = FSRS_CONSTANTS.MIN_DIFFICULTY;

    if (revlog) {
        stability = Math.max(revlog.stability, 365);
        difficulty = revlog.difficulty;
    }

    const newRevlog = new Revlog({
        user: userId,
        card: cardId,
        grade: Rating.EASY as number, // Treat skip as easy
        state: State.REVIEW as number,
        due: dueDate,
        stability: stability,
        difficulty: difficulty,
        elapsed_days: revlog?.elapsed_days || 0,
        last_elapsed_days: revlog?.last_elapsed_days || 0,
        scheduled_days: fsrsParams.maximum_interval,
        review: now,
        duration: 0,
        deleted: false,
        created_at: now
    });

    await newRevlog.save();
    return 'success';
};
