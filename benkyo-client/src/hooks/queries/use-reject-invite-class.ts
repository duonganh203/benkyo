import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { AcceptRejectInviteClassRequestDto, ClassJoinResponseDto } from '@/types/class';
import { rejectInviteClassApi } from '@/api/classApi';
import { getToast } from '@/utils/getToast';

const useRejectInviteClass = () => {
    const queryClient = useQueryClient();
    return useMutation<ClassJoinResponseDto, AxiosError<ApiError>, AcceptRejectInviteClassRequestDto>({
        mutationFn: ({ classId }) => rejectInviteClassApi(classId),
        onSuccess: (data, variables) => {
            getToast('success', data.message || 'Rejected invite');
            queryClient.invalidateQueries({ queryKey: ['inviteClass'] });
            queryClient.invalidateQueries({ queryKey: ['class', variables.classId] });
        },
        onError: (error) => {
            getToast('error', error?.message || 'Failed to reject invite');
        }
    });
};

export default useRejectInviteClass;
