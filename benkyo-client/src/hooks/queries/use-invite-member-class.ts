import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { ClassJoinResponseDto, InviteMemberClassRequestDto } from '@/types/class';
import { inviteMemberToClassApi } from '@/api/classApi';
import { getToast } from '@/utils/getToast';

const useInviteMemberToClass = () => {
    const queryClient = useQueryClient();
    return useMutation<ClassJoinResponseDto, AxiosError<ApiError>, InviteMemberClassRequestDto>({
        mutationFn: ({ classId, inviteEmail }) => inviteMemberToClassApi(classId, inviteEmail),
        onSuccess: (data, variables) => {
            getToast('success', data.message || 'Invitation sent');
            queryClient.invalidateQueries({ queryKey: ['class', variables.classId] });
            queryClient.invalidateQueries({ queryKey: ['classInvited', variables.classId] });
        },
        onError: (error) => {
            getToast('error', error?.message || 'Failed to invite member');
        }
    });
};

export default useInviteMemberToClass;
