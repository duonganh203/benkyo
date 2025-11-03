import { getQuizzesByDeck } from '@/api/quizApi';
import { ApiError } from '@/types/api';
import { QuizHub } from '@/types/quiz';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

const useGetQuizzesByDeck = (classId: string, moocId: string, deckId: string) => {
    return useQuery<QuizHub[], AxiosError<ApiError>>({
        queryKey: ['quiz', classId, moocId, deckId],
        queryFn: async () => {
            const res = await getQuizzesByDeck(classId, moocId, deckId);
            return res.data;
        },
        enabled: !!classId && !!moocId && !!deckId
    });
};

export default useGetQuizzesByDeck;
