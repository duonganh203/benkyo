import { useQuery } from '@tanstack/react-query';
import { getUserPublicDecks } from '@/api/deckApi';

const useGetUserPublicDecks = () => {
    return useQuery({
        queryKey: ['userPublicDecks'],
        queryFn: getUserPublicDecks
    });
};

export default useGetUserPublicDecks;
