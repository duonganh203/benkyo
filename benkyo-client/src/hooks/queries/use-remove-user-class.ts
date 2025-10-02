import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { RemoveUserClassRequestDto, RemoveUserClassResponseDto } from '@/types/class';
import { removeUserFromClassApi } from '@/api/classApi';
import { getToast } from '@/utils/getToast';

const useRemoveUserFromClass = () => {
    const queryClient = useQueryClient();
    return useMutation<RemoveUserClassResponseDto, AxiosError<ApiError>, RemoveUserClassRequestDto>({
        mutationFn: ({ classId, userId }) => removeUserFromClassApi(classId, userId),
        onSuccess: (data, variables) => {
            getToast('success', data.message || 'Member removed');
            queryClient.invalidateQueries({ queryKey: ['classMember', variables.classId] });
            queryClient.invalidateQueries({ queryKey: ['class', variables.classId] });
        },
        onError: (error) => {
            getToast('error', error?.message || 'Failed to remove member');
        }
    });
};

export default useRemoveUserFromClass;
