import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { ClassJoinResponseDto, ClassRejectRequestJoinDto } from '@/types/class';
import { rejectJoinClassApi } from '@/api/classApi';
import { getToast } from '@/utils/getToast';

const useRejectJoinClass = () => {
    const queryClient = useQueryClient();
    return useMutation<ClassJoinResponseDto, AxiosError<ApiError>, ClassRejectRequestJoinDto>({
        mutationFn: ({ classId, userId }) => rejectJoinClassApi(classId, userId),
        onSuccess: (data, variables) => {
            getToast('success', data.message || 'Rejected join request');
            queryClient.invalidateQueries({ queryKey: ['classRequestJoin', variables.classId] });
        },
        onError: (error) => {
            getToast('error', error?.message || 'Failed to reject join request');
        }
    });
};

export default useRejectJoinClass;
