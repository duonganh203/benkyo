import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { requestJoinClassApi } from '@/api/classApi';
import { ClassJoinRequestDto, ClassJoinResponseDto } from '@/types/class';

const useRequestJoinClass = () =>
    useMutation<ClassJoinResponseDto, AxiosError<ApiError>, ClassJoinRequestDto>({
        mutationFn: ({ classId }) => requestJoinClassApi(classId)
    });

export default useRequestJoinClass;
