import { AxiosError } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/types/api';
import { StartClassDeckSessionResponseDto } from '@/types/class';
import { startClassDeckSessionApi } from '@/api/classApi';
import { getToast } from '@/utils/getToast';

const useStartClassDeckSession = () => {
    const queryClient = useQueryClient();
    return useMutation<
        StartClassDeckSessionResponseDto,
        AxiosError<ApiError>,
        { classId: string; deckId: string; forceNew?: boolean }
    >({
        mutationFn: ({ classId, deckId, forceNew }) => startClassDeckSessionApi(classId, deckId, forceNew),
        onSuccess: (data, variables) => {
            getToast('success', data.message || 'Session started');
            queryClient.invalidateQueries({ queryKey: ['class', variables.classId] });
            queryClient.invalidateQueries({ queryKey: ['classDeckSession', variables.classId, variables.deckId] });
        },
        onError: (error) => {
            getToast('error', error?.message || 'Failed to start session');
        }
    });
};

export default useStartClassDeckSession;
