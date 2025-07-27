import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { ApiError } from '@/types/api';
import { SaveClassDeckAnswerResponseDto } from '@/types/class';
import { saveClassDeckAnswerApi } from '@/api/classApi';

const useSaveClassDeckAnswer = () => {
    return useMutation<
        SaveClassDeckAnswerResponseDto,
        AxiosError<ApiError>,
        { classId: string; deckId: string; sessionId: string; cardId: string; correct: boolean }
    >({
        mutationFn: ({ classId, deckId, sessionId, cardId, correct }) =>
            saveClassDeckAnswerApi(classId, deckId, sessionId, cardId, correct)
    });
};

export default useSaveClassDeckAnswer;
