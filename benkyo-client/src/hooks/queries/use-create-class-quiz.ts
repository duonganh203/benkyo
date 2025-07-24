import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { createQuizPayload, CreateQuizRes } from '@/types/quiz';
import { useMutation } from '@tanstack/react-query';
import { createClassQuizApi } from '@/api/classApi';

export const useCreateClassQuiz = (classId: string) => {
    return useMutation<CreateQuizRes, AxiosError<ApiError>, createQuizPayload>({
        mutationFn: createClassQuizApi,
        mutationKey: ['createClassQuiz', classId]
    });
};
