import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { ApiError } from '@/types/api';
import { CreateDeckPayload, Deck } from '@/types/deck';
import { createDeck } from '@/api/deckApi';
const useCreateDeck = () => {
    return useMutation<Deck, AxiosError<ApiError>, CreateDeckPayload>({
        mutationFn: createDeck
    });
};
export default useCreateDeck;
