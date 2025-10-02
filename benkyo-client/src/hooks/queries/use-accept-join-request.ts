import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { ClassAcceptRequestJoinDto, ClassJoinResponseDto } from '@/types/class';
import { acceptJoinClassApi } from '@/api/classApi';
import { getToast } from '@/utils/getToast';

const useAcceptJoinClass = () => {
    const queryClient = useQueryClient();
    return useMutation<ClassJoinResponseDto, AxiosError<ApiError>, ClassAcceptRequestJoinDto>({
        mutationFn: ({ classId, userId }) => acceptJoinClassApi(classId, userId),
        onSuccess: (data, variables) => {
            getToast('success', data.message || 'Accepted join request');
            queryClient.invalidateQueries({ queryKey: ['classRequestJoin', variables.classId] });
            queryClient.invalidateQueries({ queryKey: ['classMember', variables.classId] });
        },
        onError: (error) => {
            getToast('error', error?.message || 'Failed to accept request');
        }
    });
};

export default useAcceptJoinClass;
