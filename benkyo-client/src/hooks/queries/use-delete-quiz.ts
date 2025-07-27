import { deleteClassQuizApi } from '@/api/classApi';
import { ApiError } from '@/types/api';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

const useClassDeleteQuiz = (classId: string, quizId: string) => {
    return useMutation<{ message: string }, AxiosError<ApiError>, { classId: string; quizId: string }>({
        mutationKey: ['deleteClassQuiz', classId, quizId],
        mutationFn: ({ classId, quizId }) => deleteClassQuizApi(classId, quizId)
    });
};

export default useClassDeleteQuiz;
