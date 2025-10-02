import { duplicateDeck } from '@/api/deckApi';
import { ApiError } from '@/types/api';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

const useDuplicateDeck = (deckId: string) => {
    return useMutation<{ deckId: string }, AxiosError<ApiError>, { deckId: string }>({
        mutationKey: ['duplicateDeck', deckId],
        mutationFn: ({ deckId }) => duplicateDeck(deckId)
    });
};

export default useDuplicateDeck;
