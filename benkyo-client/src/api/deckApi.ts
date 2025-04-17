import { CardInterface } from '@/types/card';
import { CreateDeckPayload, DeckDetails, DeckInterface } from '@/types/deck';
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

export const getUserDecks = async () => {
    const { data } = await api.get('decks/my-decks');
    return data as DeckInterface[];
};

export const deleteDeck = async (deckId: string) => {
    const response = await api.delete(`decks/${deckId}`);
    return response.data;
};

export const sendRequestPublicDeck = async (deckId: string) => {
    const response = await api.patch(`decks/${deckId}/request-public`);
    return response.data;
};
