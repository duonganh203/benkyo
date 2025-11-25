import { createQuizPayload, QuizAttemptPayload, QuizAttemptResult, QuizResponse } from '@/types/quiz';
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

export const getQuizzesByDeck = async (classId: string, moocId: string, deckId: string) => {
    const { data } = await api.get(`/class/${classId}/mooc/${moocId}/deck/${deckId}/quizzes`);
    return data;
};

export const submitQuizAttempt = async (
    classId: string,
    moocId: string,
    deckId: string,
    quizId: string,
    responses: QuizResponse[]
): Promise<QuizAttemptResult> => {
    const res = await api.post(`/class/${classId}/mooc/${moocId}/deck/${deckId}/quizzes/${quizId}/submit-attempt`, {
        responses
    });
    return res.data.data as QuizAttemptResult;
};
