import z from 'zod';
import { Deck, User } from '~/schemas';
import { createDeckValidation } from '~/validations/deckValidation';

export const createDeckService = async (userId: string, deckData: z.infer<typeof createDeckValidation>) => {
    const { name, description } = deckData;
    const deck = await Deck.create({ name, description });
    await User.findByIdAndUpdate(userId, { $push: { decks: deck._id } });
    const { _id: id } = deck.toObject();
    return { id };
};
