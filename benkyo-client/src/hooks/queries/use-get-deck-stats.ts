import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';

export interface DeckStatistics {
    cardCounts: {
        new: number;
        learning: number;
        review: number;
        relearning: number;
        total: number;
    };
    retentionRate: number;
    totalReviews: number;
    reviewsLast30Days: {
        _id: string;
        count: number;
    }[];
}

const getDeckStats = async (deckId: string): Promise<DeckStatistics> => {
    const response = await api.get(`/decks/${deckId}/statistics`);
    return response.data;
};

const useGetDeckStats = (deckId: string) => {
    return useQuery({
        queryKey: ['deckStats', deckId],
        queryFn: () => getDeckStats(deckId),
        enabled: !!deckId
    });
};

export default useGetDeckStats;
