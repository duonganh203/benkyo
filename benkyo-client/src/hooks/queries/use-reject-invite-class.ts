import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { AcceptRejectInviteClassRequestDto, ClassJoinResponseDto } from '@/types/class';
import { rejectInviteClassApi } from '@/api/classApi';

const useRejectInviteClass = () => {
    return useMutation<ClassJoinResponseDto, AxiosError<ApiError>, AcceptRejectInviteClassRequestDto>({
        mutationFn: ({ classId }) => rejectInviteClassApi(classId)
    });
};

export default useRejectInviteClass;
