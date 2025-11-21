import z from 'zod';
import {
    Card,
    Deck,
    DeckRating,
    PublicStatus,
    Quiz,
    QuizAttempt,
    Revlog,
    StudySession,
    User,
    UserDeckState,
    Class
} from '~/schemas';
import { createDeckValidation, updateDeckValidation } from '~/validations/deckValidation';
import { NotFoundException } from '~/exceptions/notFound';
import { ErrorCode } from '~/exceptions/root';
import { BadRequestsException } from '~/exceptions/badRequests';
import { ForbiddenRequestsException } from '~/exceptions/forbiddenRequests';
import { Types } from 'mongoose';

export const createDeckService = async (userId: string, deckData: z.infer<typeof createDeckValidation>) => {
    const { name, description } = deckData;

    // Get user's FSRS params to copy to new deck
    const user = await User.findById(userId);
    if (!user) {
        throw new NotFoundException('User not found', ErrorCode.NOT_FOUND);
    }

    // Create deck with user's FSRS params as default
    const deck = await Deck.create({
        name,
        description,
        owner: userId,
        fsrsParams: user.fsrsParams
    });

    await User.findByIdAndUpdate(userId, { $push: { decks: deck._id } });
    const userDeckState = new UserDeckState({
        user: userId,
        deck: deck._id,
        stats: {
            reviewCards: 0,
            learningCards: 0,
            newCards: 0,
            totalCards: 0
        },
        lastStudied: null
    });
    await userDeckState.save();
    const { _id: id } = deck.toObject();
    return { id };
};

export const getDeckService = async (userId: string, deckId: string) => {
    const deck = await Deck.findById(deckId).populate('owner', 'name avatar _id');
    if (!deck) {
        throw new NotFoundException('Deck not found', ErrorCode.NOT_FOUND);
    }
    if (deck.owner.equals(userId) || deck.isPublic) {
        return deck;
    }
    const classWithDeck = await Class.findOne({
        'decks.deck': deck._id,
        users: userId
    });
    if (classWithDeck) {
        return deck;
    }
    throw new ForbiddenRequestsException('You do not have permission to view this deck', ErrorCode.FORBIDDEN);
};

export const getAllDecksService = async (userId: string) => {
    // Find all deck IDs that are used in any MOOC
    const moocDeckIds = await Deck.aggregate([
        {
            $lookup: {
                from: 'moocs',
                localField: '_id',
                foreignField: 'decks.deck',
                as: 'moocRefs'
            }
        },
        {
            $match: { owner: new Types.ObjectId(userId) }
        },
        {
            $match: { moocRefs: { $size: 0 } }
        }
    ]);
    const deckIds = moocDeckIds.map((d: any) => d._id);
    const decks = await Deck.find({ _id: { $in: deckIds } }).populate('owner');
    return decks;
};
export const duplicateDeckService = async (userId: string, deckId: string) => {
    const deck = await Deck.findById(deckId);
    if (!deck) {
        throw new NotFoundException('Deck not found', ErrorCode.NOT_FOUND);
    }
    if (deck.owner.equals(userId)) {
        throw new BadRequestsException('You cannot duplicate your own deck', ErrorCode.INTERNAL_SERVER_ERROR);
    }

    // Get user's FSRS params for the duplicated deck
    const user = await User.findById(userId);
    if (!user) {
        throw new NotFoundException('User not found', ErrorCode.NOT_FOUND);
    }

    const newDeck = new Deck({
        name: deck.name,
        description: deck.description,
        owner: userId,
        cardCount: deck.cardCount,
        isPublic: false,
        publicStatus: PublicStatus.PRIVATE,
        fsrsParams: user.fsrsParams
    });
    await newDeck.save();

    const originalCards = await Card.find({ deck: deckId });

    if (originalCards.length > 0) {
        const newCards = originalCards.map((card) => ({
            front: card.front,
            back: card.back,
            deck: newDeck._id,
            state: 0,
            due: new Date(),
            stability: 0,
            difficulty: 0,
            elapsedDays: 0,
            scheduledDays: 0,
            reps: 0,
            lapses: 0
        }));

        const insertedCards = await Card.insertMany(newCards);
        console.log(`Successfully inserted ${insertedCards.length} cards to new deck`);
    }

    const userDeckState = new UserDeckState({
        user: userId,
        deck: newDeck._id,
        stats: {
            reviewCards: 0,
            learningCards: 0,
            newCards: originalCards.length,
            totalCards: originalCards.length
        },
        lastStudied: null
    });
    await userDeckState.save();

    await User.findByIdAndUpdate(userId, { $push: { decks: newDeck._id } });

    return { message: 'Deck duplicated successfully', deckId: newDeck._id };
};

export const deleteDeckService = async (userId: string, deckId: string) => {
    const deck = await Deck.findOne({ _id: deckId, owner: userId });
    if (!deck) {
        throw new NotFoundException('Deck not found or you do not have permission to delete it', ErrorCode.NOT_FOUND);
    }
    if (!deck.owner.equals(userId)) {
        throw new ForbiddenRequestsException('You dont have permission to delete this deck', ErrorCode.FORBIDDEN);
    }
    await Card.deleteMany({ deck: deckId });
    await UserDeckState.deleteMany({ deck: deckId });
    await DeckRating.deleteMany({ deck: deckId });

    await StudySession.deleteMany({ deck: deckId });
    const cardIds = await Card.find({ deck: deckId }, '_id').lean();
    if (cardIds.length > 0) {
        await Revlog.deleteMany({ card: { $in: cardIds.map((card) => card._id) } });
    }

    const quizIds = await Quiz.find({ deck: deckId }, '_id').lean();
    if (quizIds.length > 0) {
        await QuizAttempt.deleteMany({ quiz: { $in: quizIds.map((quiz) => quiz._id) } });
        await Quiz.deleteMany({ deck: deckId });
    }

    await Deck.findByIdAndDelete(deckId);
    await User.updateOne({ _id: userId }, { $pull: { decks: deckId } });
    return { message: 'Deck and all associated data deleted successfully' };
};

export const sendReqPublicDeckService = async (userId: string, deckId: string) => {
    const deck = await Deck.findById(deckId);
    if (!deck) {
        throw new NotFoundException('Deck not found', ErrorCode.NOT_FOUND);
    }
    if (!deck.owner.equals(userId)) {
        throw new ForbiddenRequestsException('You dont have permission to public this deck', ErrorCode.FORBIDDEN);
    }
    if (deck.isPublic || deck.publicStatus === PublicStatus.APPROVED) {
        throw new BadRequestsException('This deck is already public', ErrorCode.INTERNAL_SERVER_ERROR);
    }

    if (deck.publicStatus === PublicStatus.PENDING) {
        throw new BadRequestsException('This deck is already pending for approval', ErrorCode.INTERNAL_SERVER_ERROR);
    }
    await Deck.findByIdAndUpdate(deckId, {
        $set: { publicStatus: PublicStatus.PENDING, isPublic: false }
    });

    return { message: 'Request sent successfully' };
};
export const getPublicDecksService = async () => {
    return await Deck.find({ isPublic: true, publicStatus: PublicStatus.APPROVED }).populate('owner', 'name avatar');
};

export const getAllRequestedPublicDecksService = async () => {
    const decks = await Deck.find({
        publicStatus: { $in: [PublicStatus.PENDING, PublicStatus.APPROVED, PublicStatus.REJECTED] }
    }).populate('owner');
    return decks;
};

export const getUserPublicDecksService = async (userId: string) => {
    return await Deck.find({ owner: userId, publicStatus: { $in: [1, 2, 3] } }).populate('owner', 'name avatar');
};

export const getRequestPulbicDeckService = async (deckId: string) => {
    const deck = await Deck.findById(deckId).populate('owner').populate('reviewedBy').lean();

    if (!deck) {
        throw new NotFoundException('Deck not found', ErrorCode.NOT_FOUND);
    }

    const cards = await Card.find({ deck: deckId }).lean();

    return {
        ...deck,
        cards,
        reviewNote: deck.reviewNote,
        reviewedBy: deck.reviewedBy
    };
};

export const reviewPublicDeckService = async (
    deckId: string,
    status: PublicStatus,
    reviewerId: string,
    note?: string
) => {
    const deck = await Deck.findById(deckId);
    if (!deck) {
        throw new NotFoundException('Deck not found', ErrorCode.NOT_FOUND);
    }

    if (deck.publicStatus === status) {
        throw new BadRequestsException('This deck is already in this status', ErrorCode.INTERNAL_SERVER_ERROR);
    }

    const updateData: any = {
        publicStatus: status,
        isPublic: status === PublicStatus.APPROVED,
        reviewedBy: reviewerId
    };

    if (note !== undefined) {
        updateData.reviewNote = note;
    }

    await Deck.findByIdAndUpdate(deckId, { $set: updateData });

    return { message: 'Deck status and note updated successfully' };
};

export const updateDeckFsrsParamsService = async (userId: string, deckId: string, fsrsParams: any) => {
    const deck = await Deck.findById(deckId);
    if (!deck) {
        throw new NotFoundException('Deck not found', ErrorCode.NOT_FOUND);
    }

    if (!deck.owner.equals(userId)) {
        throw new ForbiddenRequestsException('You do not have permission to update this deck', ErrorCode.FORBIDDEN);
    }

    const updatedDeck = await Deck.findByIdAndUpdate(deckId, { $set: { fsrsParams } }, { new: true });

    return updatedDeck?.fsrsParams;
};

export const getDeckStatsService = async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const totalDecks = await Deck.countDocuments();

    const pendingDecks = await Deck.countDocuments({
        publicStatus: PublicStatus.PENDING
    });

    const createdThisMonth = await Deck.countDocuments({
        createdAt: { $gte: startOfMonth }
    });

    const createdLastMonth = await Deck.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });

    const growthPercentage =
        createdLastMonth === 0 ? 100 : Math.round(((createdThisMonth - createdLastMonth) / createdLastMonth) * 100);

    return {
        totalDecks,
        pendingDecks,
        createdThisMonth,
        growthPercentage
    };
};
export const updateDeckService = async (
    userId: string,
    deckId: string,
    deckData: z.infer<typeof updateDeckValidation>
) => {
    const { name, description } = deckData;

    const deck = await Deck.findOne({ _id: deckId, owner: userId });
    if (!deck) {
        throw new Error('Deck not found or you do not have permission to update it');
    }

    if (name !== undefined) deck.name = name;
    if (description !== undefined) deck.description = description;
    await deck.save();

    return deck;
};

export const toggleLikeDeckService = async (userId: string, deckId: string) => {
    const deck = await Deck.findById(deckId);
    if (!deck) {
        throw new NotFoundException('Deck not found', ErrorCode.NOT_FOUND);
    }
    const userObjectId = new Types.ObjectId(userId);
    const hasLiked = deck.likes.some((id: Types.ObjectId) => id.equals(userObjectId));
    if (hasLiked) {
        deck.likes = deck.likes.filter((id: Types.ObjectId) => !id.equals(userObjectId));
    } else {
        deck.likes.push(userObjectId);
    }
    deck.likeCount = deck.likes.length;
    await deck.save();
    return {
        message: hasLiked ? 'Unliked deck successfully' : 'Liked deck successfully',
        likeCount: deck.likeCount,
        liked: !hasLiked
    };
};
export const getLikedDecksByUserService = async (userId: string) => {
    const userObjectId = new Types.ObjectId(userId);

    const likedDecks = await Deck.find({ likes: userObjectId })
        .sort({ updatedAt: -1 })
        .populate('owner', 'name')
        .lean();

    return likedDecks.map((deck) => {
        const owner = deck.owner as { name?: string };

        return {
            id: deck._id.toString(),
            name: deck.name,
            description: deck.description,
            likeCount: deck.likeCount || 0,
            cardCount: deck.cardCount || 0,
            creatorName: owner?.name || 'Unknown',
            createdAt: deck.createdAt,
            updatedAt: deck.updatedAt
        };
    });
};
