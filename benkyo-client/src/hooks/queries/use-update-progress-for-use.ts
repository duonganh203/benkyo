import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { updateDeckProgressForUser } from '@/api/moocApi';

export type UpdateDeckProgressPayload = {
    moocId: string;
    deckId: string;
    lastSeenIndex: number;
    totalCards: number;
};

export type UpdateDeckProgressRes = {
    success: boolean;
    message: string;
    data?: { deck: string; lastSeenIndex: number; progress: number };
};

const useUpdateDeckProgress = () => {
    return useMutation<UpdateDeckProgressRes, AxiosError<ApiError>, UpdateDeckProgressPayload>({
        mutationFn: ({ moocId, deckId, lastSeenIndex, totalCards }) => {
            console.log('Calling API', { moocId, deckId, lastSeenIndex, totalCards });
            return updateDeckProgressForUser(moocId, deckId, lastSeenIndex, totalCards);
        }
    });
};

export default useUpdateDeckProgress;
