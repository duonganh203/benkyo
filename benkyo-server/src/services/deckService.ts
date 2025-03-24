import z from 'zod';
import { Card, Deck, DeckRating, Revlog, StudySession, User, UserDeckState } from '~/schemas';
import { createDeckValidation } from '~/validations/deckValidation';
import { NotFoundException } from '~/exceptions/notFound';
import { ErrorCode } from '~/exceptions/root';

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
    const session = await mongoose.startSession();
    await Card.deleteMany({ deck: deckId }, { session });
    await UserDeckState.deleteMany({ deck: deckId }, { session });
    await DeckRating.deleteMany({ deck: deckId }, { session });
    await StudySession.deleteMany({ deck: deckId }, { session });
    const cardIds = await Card.find({ deck: deckId }, '_id').lean();
    if (cardIds.length > 0) {
        await Revlog.deleteMany({ card: { $in: cardIds.map((card) => card._id) } }, { session });
    }
    await Deck.findByIdAndDelete(deckId, { session });
    await User.updateOne({ _id: userId }, { $pull: { decks: deckId } }, { session });
    return { message: 'Deck and all associated data deleted successfully' };
};
