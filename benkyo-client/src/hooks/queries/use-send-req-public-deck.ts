import { sendRequestPublicDeck } from '@/api/deckApi';
import { ApiError } from '@/types/api';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

const useSendReqPublicDeck = (deckId: string) => {
    return useMutation<void, AxiosError<ApiError>>({
        mutationFn: () => sendRequestPublicDeck(deckId),
        mutationKey: ['sendRequestPublicDeck', deckId]
    });
};

export default useSendReqPublicDeck;
