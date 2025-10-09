import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleLikeDeck } from '@/api/deckApi';
import { DeckInterface } from '@/types/deck';

interface ToggleLikeRes {
    likeCount: number;
    liked: boolean;
}

const useToggleLikeDeck = (deckId: string, updateDeckState?: (deck: Partial<DeckInterface>) => void) => {
    const queryClient = useQueryClient();

    return useMutation<DeckInterface, unknown, void>({
        mutationFn: async () => {
            const updated = await toggleLikeDeck(deckId);
            return updated;
        },
        onSuccess: (updated) => {
            if (updateDeckState) {
                updateDeckState({
                    likeCount: updated.likeCount,
                    liked: updated.liked
                });
            }
            queryClient.invalidateQueries({ queryKey: ['deck', deckId] });
        }
    });
};

export default useToggleLikeDeck;
