import { api } from '.';
import { BatchImportCard, CardFormData, CreateCardRes } from '@/types/card';

export const createCard = async (data: CardFormData) => {
    const res = await api.post('cards', data);
    return res.data as CreateCardRes;
};

export const batchCreateCards = async (data: { cards: BatchImportCard[]; deckId: string }) => {
    const res = await api.post('cards/batch', data);
    return res.data;
};

export const deleteCard = async (id: string) => {
    const res = await api.delete(`cards/${id}`);
    return res.data;
};
