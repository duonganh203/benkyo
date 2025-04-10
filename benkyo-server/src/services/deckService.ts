import z from 'zod';
import { Card, Deck, DeckRating, PublicStatus, Revlog, StudySession, User, UserDeckState } from '~/schemas';
import { createDeckValidation } from '~/validations/deckValidation';
import { NotFoundException } from '~/exceptions/notFound';
import { ErrorCode } from '~/exceptions/root';
import { BadRequestsException } from '~/exceptions/badRequests';
import { UnauthorizedException } from '~/exceptions/unauthorized';

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
        throw new Error('Deck not found');
    }
    if (!deck.owner.equals(userId) && !deck.isPublic) {
        throw new Error('You do not have permission to view this deck');
    }
    return deck;
};

export const getAllDecksService = async (userId: string) => {
    const decks = await Deck.find({ owner: userId }).populate('owner');
    const publicDeck = await Deck.find({ owner: { $ne: userId }, isPublic: true }).populate('owner');
    return [...decks, ...publicDeck];
};

export const deleteDeckService = async (userId: string, deckId: string) => {
    const deck = await Deck.findOne({ _id: deckId, owner: userId });
    if (!deck) {
        throw new NotFoundException('Deck not found or you do not have permission to delete it', ErrorCode.NOT_FOUND);
    }
    await Card.deleteMany({ deck: deckId });
    await UserDeckState.deleteMany({ deck: deckId });
    await DeckRating.deleteMany({ deck: deckId });
    await StudySession.deleteMany({ deck: deckId });
    const cardIds = await Card.find({ deck: deckId }, '_id').lean();
    if (cardIds.length > 0) {
        await Revlog.deleteMany({ card: { $in: cardIds.map((card) => card._id) } });
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
        throw new UnauthorizedException('You dont have permission to public this deck', ErrorCode.UNAUTHORIZED);
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
