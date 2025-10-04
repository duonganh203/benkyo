import { toggleLikeDeck, getLikedDecks } from '@/api/deckApi';
import { ApiError } from '@/types/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

interface ToggleLikeDeckRes {
    message: string;
    likeCount: number;
    liked: boolean;
}

const useToggleLikeDeck = (deckId: string) => {
    const queryClient = useQueryClient();

    return useMutation<ToggleLikeDeckRes, AxiosError<ApiError>, void>({
        mutationKey: ['toggleLikeDeck', deckId],
        mutationFn: () => toggleLikeDeck(deckId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['likedDecks'] });
        }
    });
};

export default useToggleLikeDeck;
