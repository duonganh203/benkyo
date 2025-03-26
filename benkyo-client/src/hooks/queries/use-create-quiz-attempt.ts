import { saveQuizAttempt } from '@/api/quizApi';
import { ApiError } from '@/types/api';
import { QuizAttemptPayload, QuizAttemptRes } from '@/types/quiz';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

const useSaveQuizAttempt = () => {
    return useMutation<QuizAttemptRes, AxiosError<ApiError>, QuizAttemptPayload>({
        mutationFn: saveQuizAttempt
    });
};

export default useSaveQuizAttempt;
