import { AxiosError } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/types/api';
import { DeckInterface, UpdateDeckPayload } from '@/types/deck';
import { updateDeck } from '@/api/deckApi';

const useUpdateDeck = () => {
    const queryClient = useQueryClient();

    return useMutation<DeckInterface, AxiosError<ApiError>, { deckId: string; payload: Partial<UpdateDeckPayload> }>({
        mutationFn: ({ deckId, payload }) => updateDeck(deckId, payload),

        onSuccess: (updatedDeck) => {
            queryClient.setQueryData<DeckInterface[]>(['decks'], (old) => {
                if (!old) return [];
                return old.map((deck) => (deck._id === updatedDeck._id ? { ...deck, ...updatedDeck } : deck));
            });
            queryClient.setQueryData<DeckInterface>(['deck', updatedDeck._id], (old) =>
                old ? { ...old, ...updatedDeck } : updatedDeck
            );

            queryClient.invalidateQueries({ queryKey: ['decks'] });
            queryClient.invalidateQueries({ queryKey: ['deck', updatedDeck._id] });
        }
    });
};

export default useUpdateDeck;
