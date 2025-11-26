import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { ApiError } from '@/types/api';
import { updateMoocProgress } from '@/api/moocApi'; // gọi API PUT /moocs/:id/progress
import { MoocInterface } from '@/types/mooc';

export interface UpdateProgressRes {
    success: boolean;
    message: string;
    data?: MoocInterface;
}

const useUpdateMoocProgress = () => {
    return useMutation<
        UpdateProgressRes,
        AxiosError<ApiError>,
        { moocId: string; payload: { userId: string; deckId: string; completed: boolean } }
    >({
        mutationFn: ({ moocId, payload }) => updateMoocProgress(moocId, payload)
    });
};

export default useUpdateMoocProgress;
