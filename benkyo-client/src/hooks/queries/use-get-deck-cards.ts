import { useQuery } from '@tanstack/react-query';
import { getDeckCards } from '@/api/deckApi';

const useGetDeckCards = (deckId: string) => {
    return useQuery({
        queryKey: ['deckCards', deckId],
        queryFn: () => getDeckCards(deckId),
        enabled: !!deckId
    });
};

export default useGetDeckCards;
