import { useQueries } from '@tanstack/react-query';
import { getDeckCards } from '@/api/deckApi';

export const useGetAllDeckCards = (deckIds: string[]) => {
    return useQueries({
        queries: deckIds.map((id) => ({
            queryKey: ['deckCards', id],
            queryFn: () => getDeckCards(id),
            enabled: Boolean(id),
            staleTime: 5000
        }))
    });
};
