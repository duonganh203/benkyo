import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { ClassJoinResponseDto, ClassRejectRequestJoinDto } from '@/types/class';
import { rejectJoinClassApi } from '@/api/classApi';

const useRejectJoinClass = () => {
    return useMutation<ClassJoinResponseDto, AxiosError<ApiError>, ClassRejectRequestJoinDto>({
        mutationFn: ({ classId, userId }) => rejectJoinClassApi(classId, userId)
    });
};

export default useRejectJoinClass;
