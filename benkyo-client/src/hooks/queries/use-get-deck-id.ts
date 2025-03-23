import { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/types/api';
import { getDeckById } from '@/api/deckApi';
import { DeckDetails } from '@/types/deck';

const useGetDeckById = (deckId: string) => {
    return useQuery<DeckDetails, AxiosError<ApiError>>({
        queryKey: ['deck', deckId],
        queryFn: () => getDeckById(deckId),
        enabled: !!deckId
    });
};

export default useGetDeckById;
