import { getQuizAttemptById } from '@/api/quizApi';
import { ApiError } from '@/types/api';
import { QuizAttemptRes } from '@/types/quiz';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

const useGetQuizAttempt = (quizAttemptId: string) => {
    return useQuery<QuizAttemptRes, AxiosError<ApiError>>({
        queryKey: ['quizAttempt', quizAttemptId],
        queryFn: () => getQuizAttemptById(quizAttemptId)
    });
};
export default useGetQuizAttempt;
