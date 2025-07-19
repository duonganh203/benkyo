import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { ClassAcceptRequestJoinDto, ClassJoinResponseDto } from '@/types/class';
import { acceptJoinClassApi } from '@/api/classApi';

const useAcceptJoinClass = () => {
    return useMutation<ClassJoinResponseDto, AxiosError<ApiError>, ClassAcceptRequestJoinDto>({
        mutationFn: ({ classId, userId }) => acceptJoinClassApi(classId, userId)
    });
};

export default useAcceptJoinClass;
