import { getAllQuizAttempts } from '@/api/quizApi';
import { QuizAllAttemptRes } from '@/types/quiz';
import { useQuery } from '@tanstack/react-query';

const useGetAllAttempts = () => {
    return useQuery<QuizAllAttemptRes[]>({
        queryKey: ['quizAttempt'],
        queryFn: getAllQuizAttempts
    });
};

export default useGetAllAttempts;
