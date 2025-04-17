import { useQuery } from '@tanstack/react-query';
import { getPublicDecks } from '@/api/deckApi';

const useGetPublicDecks = () => {
    return useQuery({
        queryKey: ['publicDecks'],
        queryFn: getPublicDecks
    });
};

export default useGetPublicDecks;
