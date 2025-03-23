import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Rating } from '@/types/card';
import { ApiError } from '@/types/api';
import { submitCardReview, ReviewResult } from '@/api/studyApi';

interface SubmitReviewProps {
    cardId: string;
    rating: Rating;
    reviewTime: number;
}

const useSubmitReview = (deckId: string) => {
    const queryClient = useQueryClient();

    return useMutation<ReviewResult, AxiosError<ApiError>, SubmitReviewProps>({
        mutationFn: submitCardReview,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deckCards', deckId] });
        }
    });
};

export default useSubmitReview;
