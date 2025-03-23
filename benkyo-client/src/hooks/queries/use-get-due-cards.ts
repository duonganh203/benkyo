import { useQuery } from '@tanstack/react-query';
import { getDueCards } from '@/api/studyApi';

const useGetDueCards = (deckId: string) => {
    return useQuery({
        queryKey: ['dueCards', deckId],
        queryFn: () => getDueCards(deckId),
        enabled: !!deckId
    });
};

export default useGetDueCards;
