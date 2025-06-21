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
    const deck = await Deck.findById(deckId);
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
    const publicDeck = await Deck.find({
        owner: { $ne: userId },
        isPublic: true,
        subscribers: { $in: [userId] }
    }).populate('owner');
    return [...decks, ...publicDeck];
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

export const subscribeToDeckService = async (userId: string, deckId: string) => {
    const deck = await Deck.findById(deckId);
    if (!deck) {
        throw new NotFoundException('Deck not found', ErrorCode.NOT_FOUND);
    }

    if (!deck.isPublic && deck.publicStatus !== PublicStatus.APPROVED) {
        throw new ForbiddenRequestsException(
            'You do not have permission to subscribe to this deck',
            ErrorCode.FORBIDDEN
        );
    }
    if (deck.owner.equals(userId)) {
        throw new BadRequestsException('You cannot subscribe to your own deck', ErrorCode.INTERNAL_SERVER_ERROR);
    }

    if (deck.subscribers.some((subscriberId) => subscriberId.equals(userId))) {
        return { message: 'Already subscribed to this deck', isSubscribed: true };
    }

    await Deck.findByIdAndUpdate(deckId, {
        $addToSet: { subscribers: userId }
    });

    const existingUserDeckState = await UserDeckState.findOne({
        user: userId,
        deck: deckId
    });

    if (!existingUserDeckState) {
        const userDeckState = new UserDeckState({
            user: userId,
            deck: deckId,
            isOriginalOwner: deck.owner.equals(userId),
            stats: {
                reviewCards: 0,
                learningCards: 0,
                newCards: 0,
                totalCards: deck.cardCount || 0
            },
            lastStudied: null
        });
        await userDeckState.save();
    }

    return { message: 'Successfully subscribed to deck', isSubscribed: true };
};
