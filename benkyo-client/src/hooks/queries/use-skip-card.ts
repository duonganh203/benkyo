import { skipCard } from '@/api/studyApi';
import { ApiError } from '@/types/api';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

const useSkipCard = (deckId: string) => {
    return useMutation<void, AxiosError<ApiError>, { cardId: string }>({
        mutationFn: ({ cardId }) => skipCard(cardId),
        mutationKey: ['skipCard', deckId]
    });
};

export default useSkipCard;
