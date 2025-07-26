import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { CreateQuizAIRes, createQuizPayload } from '@/types/quiz';
import { useMutation } from '@tanstack/react-query';
import { createClassQuizAIAPI } from '@/api/classApi';

export const useCreateClassAIQuiz = () => {
    return useMutation<CreateQuizAIRes, AxiosError<ApiError>, createQuizPayload>({
        mutationFn: createClassQuizAIAPI,
        mutationKey: ['createClassAIQuiz']
    });
};
