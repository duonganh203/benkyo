import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { QuizAttemptResult, QuizResponse } from '@/types/quiz';
import { submitQuizAttempt } from '@/api/quizApi';

export const useSubmitQuizAttempt = (classId: string, moocId: string, deckId: string, quizId: string) => {
    return useMutation<QuizAttemptResult, AxiosError<ApiError>, QuizResponse[]>({
        mutationFn: (responses) => submitQuizAttempt(classId, moocId, deckId, quizId, responses)
    });
};
