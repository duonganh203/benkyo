import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { createQuizPayload, CreateQuizRes } from '@/types/quiz';
import { useMutation } from '@tanstack/react-query';
import { createQuiz } from '@/api/quizApi';

export const useCreateQuiz = (deckId: string) => {
    return useMutation<CreateQuizRes, AxiosError<ApiError>, createQuizPayload>({
        mutationFn: createQuiz,
        mutationKey: ['createQuiz', deckId]
    });
};
