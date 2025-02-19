import z from 'zod';
import { Deck } from '~/schemas/deckSchema';
import { createDeckValidation } from '~/validations/deckValidation';

export const createDeckService = async (userId: string, deckData: z.infer<typeof createDeckValidation>) => {
    const { name, description } = deckData;
    const deck = await Deck.create({ userId, name, description });
    return deck;
};
