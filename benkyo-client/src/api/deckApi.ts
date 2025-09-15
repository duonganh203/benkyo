import { CardInterface } from '@/types/card';
import { CreateDeckPayload, DeckDetails, DeckInterface } from '@/types/deck';
import { api } from '.';
import { FSRSParamsSchema } from '@/schemas/deckSchema';
import { z } from 'zod';

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
export const getPublicDecks = async () => {
    const response = await api.get('decks/public-deck');
    return response.data;
};

export const getUserPublicDecks = async () => {
    const response = await api.get('decks/user-public-decks');
    return response.data;
};

export const duplicateDeck = async (deckId: string) => {
    const response = await api.post(`decks/${deckId}/duplicate`);
    return response.data;
};

export const updateDeckFsrsParams = async (deckId: string, fsrsParams: z.infer<typeof FSRSParamsSchema>) => {
    const response = await api.patch(`decks/${deckId}/fsrs`, fsrsParams);
    return response.data;
};
