import { useMutation } from '@tanstack/react-query';
import { createMoocDeckQuizApi } from '@/api/classApi';
import { MoocDeckQuizInterface } from '@/types/quiz';

interface CreateMoocDeckQuizPayload {
    moocId: string;
    deckId: string;
    title: string;
    description?: string;
    type: string;
    questions: {
        questionText: string;
        choices: { text: string }[];
        correctAnswer: number;
    }[];
}

export const useCreateMoocDeckQuiz = (classId: string) => {
    return useMutation<
        { success: boolean; message: string; data: MoocDeckQuizInterface },
        Error,
        CreateMoocDeckQuizPayload
    >({
        mutationFn: (payload) => createMoocDeckQuizApi(classId, payload)
    });
};
