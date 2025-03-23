import { useQuery } from '@tanstack/react-query';
import { getUserDecks } from '@/api/deckApi';
import { DeckInterface } from '@/types/deck';

const useGetUserDecks = () => {
    return useQuery<DeckInterface[]>({
        queryKey: ['userDecks'],
        queryFn: getUserDecks
    });
};

export default useGetUserDecks;
