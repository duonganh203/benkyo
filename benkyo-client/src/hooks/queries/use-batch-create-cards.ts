import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { ApiError } from '@/types/api';
import { BatchImportCard } from '@/types/card';
import { batchCreateCards } from '@/api/cardApi';

const useBatchCreateCards = () => {
    return useMutation<any, AxiosError<ApiError>, { cards: BatchImportCard[]; deckId: string }>({
        mutationFn: batchCreateCards
    });
};

export default useBatchCreateCards;
