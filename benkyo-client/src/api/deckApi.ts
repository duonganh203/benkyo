import { api } from '.';
import { CreateDeckPayload } from '@/types/deck';

export const createDeck = async (deck: CreateDeckPayload) => {
    const { data } = await api.post('deck', deck);
    return data;
};
