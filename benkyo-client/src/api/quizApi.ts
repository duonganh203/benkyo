import { createQuizPayload, QuizAttemptPayload } from '@/types/quiz';
import { api } from '.';

export const createQuiz = async (payload: createQuizPayload) => {
    const { data } = await api.post('/quiz', payload);
    return data;
};

export const getQuizById = async (quizId: string) => {
    const { data } = await api.get(`/quiz/${quizId}`);
    return data;
};

export const saveQuizAttempt = async (payload: QuizAttemptPayload) => {
    const { quizId, ...quizAttemptData } = payload;
    const { data } = await api.post(`/quiz/${quizId}/attempt`, { quizAttemptData });
    return data;
};

export const getQuizAttemptById = async (quizAttemptId: string) => {
    const { data } = await api.get(`/quiz/attempt/${quizAttemptId}`);
    return data;
};

export const getAllQuizAttempts = async () => {
    const { data } = await api.get(`/quiz/attempts`);
    return data;
};
