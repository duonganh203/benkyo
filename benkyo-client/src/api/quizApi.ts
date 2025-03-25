import { createQuizPayload } from '@/types/quiz';
import { api } from '.';

export const createQuiz = async (payload: createQuizPayload) => {
    const { data } = await api.post('/quiz', payload);
    return data;
};
