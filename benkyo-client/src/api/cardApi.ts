import { api } from '.';
import { BatchImportCard, CardFormData, CreateCardRes, updateCardRes } from '@/types/card';

export const createCard = async (data: CardFormData) => {
    const res = await api.post('cards', data);
    return res.data as CreateCardRes;
};

export const batchCreateCards = async (data: { cards: BatchImportCard[]; deckId: string }) => {
    const res = await api.post('cards/batch', data);
    return res.data;
};

export const getCardById = async (id: string) => {
    const res = await api.get(`cards/${id}`);
    return res.data;
};

export const updateCard = async (id: string, data: CardFormData) => {
    const res = await api.put(`cards/${id}`, data);
    return res.data as updateCardRes;
};

export const deleteCard = async (id: string) => {
    const res = await api.delete(`cards/${id}`);
    return res.data;
};
