import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { ClassJoinResponseDto, InviteMemberClassRequestDto } from '@/types/class';
import { inviteMemberToClassApi } from '@/api/classApi';

const useInviteMemberToClass = () => {
    return useMutation<ClassJoinResponseDto, AxiosError<ApiError>, InviteMemberClassRequestDto>({
        mutationFn: ({ classId, inviteEmail }) => inviteMemberToClassApi(classId, inviteEmail)
    });
};

export default useInviteMemberToClass;
