import { getQuizById } from '@/api/quizApi';
import { ApiError } from '@/types/api';
import { QuizRes } from '@/types/quiz';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

const useGetQuizId = (quizId: string) => {
    return useQuery<QuizRes, AxiosError<ApiError>>({
        queryKey: ['quiz', quizId],
        queryFn: () => getQuizById(quizId),
        enabled: !!quizId
    });
};
export default useGetQuizId;
