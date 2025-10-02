import { AxiosError } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/types/api';
import { EndClassDeckSessionResponseDto } from '@/types/class';
import { endClassDeckSessionApi } from '@/api/classApi';
import { getToast } from '@/utils/getToast';

const useEndClassDeckSession = () => {
    const queryClient = useQueryClient();
    return useMutation<
        EndClassDeckSessionResponseDto,
        AxiosError<ApiError>,
        { classId: string; deckId: string; sessionId: string; duration: number }
    >({
        mutationFn: ({ classId, deckId, sessionId, duration }) =>
            endClassDeckSessionApi(classId, deckId, sessionId, duration),
        onSuccess: (_data, variables) => {
            getToast('success', 'Session ended');
            queryClient.invalidateQueries({ queryKey: ['class-user', variables.classId] });
            queryClient.invalidateQueries({ queryKey: ['class', variables.classId] });
            queryClient.invalidateQueries({ queryKey: ['classDeckSession', variables.classId, variables.deckId] });
        },
        onError: (error) => {
            getToast('error', error?.message || 'Failed to end session');
        }
    });
};

export default useEndClassDeckSession;
