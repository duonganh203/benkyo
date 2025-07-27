import { useQuery } from '@tanstack/react-query';
import { getCardDetails } from '@/api/cardApi';

const useGetCardDetails = (cardId: string) => {
    return useQuery({
        queryKey: ['cardDetails', cardId],
        queryFn: () => getCardDetails(cardId),
        enabled: !!cardId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false
    });
};

export default useGetCardDetails;
