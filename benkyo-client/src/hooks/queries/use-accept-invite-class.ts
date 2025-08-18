import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { AcceptRejectInviteClassRequestDto, ClassJoinResponseDto } from '@/types/class';
import { acceptInviteClassApi } from '@/api/classApi';
import { getToast } from '@/utils/getToast';

const useAcceptInviteClass = () => {
    const queryClient = useQueryClient();
    return useMutation<ClassJoinResponseDto, AxiosError<ApiError>, AcceptRejectInviteClassRequestDto>({
        mutationFn: ({ classId }) => acceptInviteClassApi(classId),
        onSuccess: (data, variables) => {
            getToast('success', data.message || 'Accepted invite');
            queryClient.invalidateQueries({ queryKey: ['inviteClass'] });
            queryClient.invalidateQueries({ queryKey: ['class', variables.classId] });
        },
        onError: (error) => {
            getToast('error', error?.message || 'Failed to accept invite');
        }
    });
};

export default useAcceptInviteClass;
