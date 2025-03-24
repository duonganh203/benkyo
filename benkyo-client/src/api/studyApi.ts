import { Rating } from '@/types/card';
import { api } from '.';

export interface ReviewResult {
    state: number;
    due: string;
    interval: number;
}

export const getDueCards = async (deckId: string) => {
    const response = await api.get(`fsrs/due-cards/${deckId}`);
    if (Array.isArray(response.data)) {
        return response.data;
    } else if (response.data.dueCardIds) {
        return response.data.dueCardIds;
    } else {
        console.warn('Unexpected response structure:', response.data);
        return [];
    }
};

export const submitCardReview = async ({
    cardId,
    rating,
    reviewTime
}: {
    cardId: string;
    rating: Rating;
    reviewTime: number;
}) => {
    const response = await api.post('fsrs/review', {
        cardId,
        rating,
        reviewTime
    });
    return response.data as ReviewResult;
};

export const skipCard = async (cardId: string) => {
    const response = await api.post('fsrs/skip', { cardId });
    return response.data;
};
