import { CardInterface } from '@/types/card';
import { CreateDeckPayload, DeckDetails } from '@/types/deck';
import { api } from '.';

export const createDeck = async (deck: CreateDeckPayload) => {
    const { data } = await api.post('decks', deck);
    return data;
};

export const getDeckById = async (deckId: string) => {
    const { data } = await api.get(`decks/${deckId}`);
    return data as DeckDetails;
};

export const getDeckCards = async (deckId: string) => {
    const { data } = await api.get(`decks/${deckId}/cards`);
    return data.cards as CardInterface[];
};
