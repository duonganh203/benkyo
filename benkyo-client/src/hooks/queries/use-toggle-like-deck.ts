import { toggleLikeDeck } from '@/api/deckApi';
import { ApiError } from '@/types/api';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

interface ToggleLikeDeckRes {
    message: string;
    likeCount: number;
    liked: boolean;
}

const useToggleLikeDeck = (deckId: string) => {
    return useMutation<ToggleLikeDeckRes, AxiosError<ApiError>, void>({
        mutationKey: ['toggleLikeDeck', deckId],
        mutationFn: () => toggleLikeDeck(deckId)
    });
};

export default useToggleLikeDeck;
