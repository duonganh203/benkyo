import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { ApiError } from '@/types/api';
import { updateClassQuizApi } from '@/api/classApi';
import { createQuizPayload, CreateQuizRes } from '@/types/quiz';

type UpdateClassQuizParams = {
    classId: string;
    quizId: string;
    data: createQuizPayload;
};

const useUpdateClassQuiz = () => {
    return useMutation<CreateQuizRes, AxiosError<ApiError>, UpdateClassQuizParams>({
        mutationFn: ({ classId, quizId, data }) => updateClassQuizApi(classId, quizId, data)
    });
};
export default useUpdateClassQuiz;
