import { useQuery } from '@tanstack/react-query';
import { getClassQuizApi } from '@/api/classApi';
import { ApiError } from '@/types/api';
import { CreateQuizRes } from '@/types/quiz';
import { AxiosError } from 'axios';

const useGetAllClassQuiz = (classId: string) => {
    return useQuery<CreateQuizRes[], AxiosError<ApiError>>({
        queryKey: ['class-quizzes', classId],
        queryFn: () => getClassQuizApi(classId),
        enabled: !!classId
    });
};

export default useGetAllClassQuiz;
