import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { createQuizPayload, CreateQuizRes } from '@/types/quiz';
import { updateMoocDeckQuizApi } from '@/api/classApi';

export type UpdateMoocDeckQuizParams = {
    classId: string;
    quizId: string;
    moocId: string;
    deckId: string;
    data: createQuizPayload;
};

const useUpdateClassQuiz = () => {
    return useMutation<CreateQuizRes, AxiosError<ApiError>, UpdateMoocDeckQuizParams>({
        mutationKey: ['updateClassQuiz'],
        mutationFn: ({ classId, quizId, moocId, deckId, data }) =>
            updateMoocDeckQuizApi(classId, quizId, moocId, deckId, data)
    });
};

export default useUpdateClassQuiz;
