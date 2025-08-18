import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelInviteApi } from '@/api/classApi';
import { getToast } from '@/utils/getToast';

interface CancelInviteParams {
    classId: string;
    userId: string;
}

const useCancelInvite = () => {
    const queryClient = useQueryClient();
    return useMutation<{ message: string }, AxiosError<ApiError>, CancelInviteParams>({
        mutationFn: ({ classId, userId }) => cancelInviteApi(classId, userId),
        onSuccess: (data, variables) => {
            getToast('success', data.message || 'Invite cancelled');
            queryClient.invalidateQueries({ queryKey: ['classInvited', variables.classId] });
            queryClient.invalidateQueries({ queryKey: ['class', variables.classId] });
        },
        onError: (error) => {
            getToast('error', error?.message || 'Failed to cancel invite');
        }
    });
};

export default useCancelInvite;
