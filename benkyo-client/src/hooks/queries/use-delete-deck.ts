import { deleteDeck } from '@/api/deckApi';
import { ApiError } from '@/types/api';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

const useDeleteDeck = (deckId: string) => {
    return useMutation<{ deckId: string }, AxiosError<ApiError>, { deckId: string }>({
        mutationKey: ['deleteDeck', deckId],
        mutationFn: ({ deckId }) => deleteDeck(deckId)
    });
};

export default useDeleteDeck;
