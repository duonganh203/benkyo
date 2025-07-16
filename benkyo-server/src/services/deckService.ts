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
    UserDeckState
} from '~/schemas';
import { createDeckValidation } from '~/validations/deckValidation';
import { NotFoundException } from '~/exceptions/notFound';
import { ErrorCode } from '~/exceptions/root';
import { BadRequestsException } from '~/exceptions/badRequests';
import { ForbiddenRequestsException } from '~/exceptions/forbiddenRequests';

export const createDeckService = async (userId: string, deckData: z.infer<typeof createDeckValidation>) => {
    const { name, description } = deckData;
    const deck = await Deck.create({ name, description, owner: userId });
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
    if (!deck.owner.equals(userId) && !deck.isPublic) {
        throw new ForbiddenRequestsException('You do not have permission to view this deck', ErrorCode.FORBIDDEN);
    }
    return deck;
};

export const getAllDecksService = async (userId: string) => {
    const decks = await Deck.find({ owner: userId }).populate('owner');
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

    const newDeck = new Deck({
        name: deck.name,
        description: deck.description,
        owner: userId,
        cardCount: deck.cardCount,
        isPublic: false,
        publicStatus: PublicStatus.PRIVATE
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
