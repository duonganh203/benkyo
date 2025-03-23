import z from 'zod';
import { Deck, User } from '~/schemas';
import { createDeckValidation } from '~/validations/deckValidation';

export const createDeckService = async (userId: string, deckData: z.infer<typeof createDeckValidation>) => {
    const { name, description } = deckData;
    const deck = await Deck.create({ name, description, owner: userId });
    await User.findByIdAndUpdate(userId, { $push: { decks: deck._id } });
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
