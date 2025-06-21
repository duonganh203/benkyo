import { subscribeToDeck } from '@/api/deckApi';
import { ApiError } from '@/types/api';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

interface SubscribeToDeckResponse {
    message: string;
    isSubscribed: boolean;
}

const useSubscribeToDeck = (deckId: string) => {
    return useMutation<SubscribeToDeckResponse, AxiosError<ApiError>>({
        mutationFn: () => subscribeToDeck(deckId),
        mutationKey: ['subscribeToDeck', deckId]
    });
};

export default useSubscribeToDeck;
