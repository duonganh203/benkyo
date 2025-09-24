import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { ApiError } from '@/types/api';
import { DeckInterface, UpdateDeckPayload } from '@/types/deck';
import { updateDeck } from '@/api/deckApi';

const useUpdateDeck = () => {
    return useMutation<DeckInterface, AxiosError<ApiError>, { deckId: string; payload: Partial<UpdateDeckPayload> }>({
        mutationFn: ({ deckId, payload }) => updateDeck(deckId, payload)
    });
};

export default useUpdateDeck;
