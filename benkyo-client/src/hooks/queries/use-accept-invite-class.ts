import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { AcceptRejectInviteClassRequestDto, ClassJoinResponseDto } from '@/types/class';
import { acceptInviteClassApi } from '@/api/classApi';

const useAcceptInviteClass = () => {
    return useMutation<ClassJoinResponseDto, AxiosError<ApiError>, AcceptRejectInviteClassRequestDto>({
        mutationFn: ({ classId }) => acceptInviteClassApi(classId)
    });
};

export default useAcceptInviteClass;
