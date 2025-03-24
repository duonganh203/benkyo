import { getCardById } from '@/api/cardApi';
import { useQuery } from '@tanstack/react-query';

const useGetCardId = (cardId: string) => {
    return useQuery({
        queryKey: ['cardId', cardId],
        queryFn: () => getCardById(cardId),
        enabled: !!cardId
    });
};

export default useGetCardId;
