import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { ClassJoinResponseDto, RemoveUserClassRequestDto } from '@/types/class';
import { removeUserFromClassApi } from '@/api/classApi';

const useRemoveUserFromClass = () => {
    return useMutation<ClassJoinResponseDto, AxiosError<ApiError>, RemoveUserClassRequestDto>({
        mutationFn: ({ classId, userId }) => removeUserFromClassApi(classId, userId)
    });
};

export default useRemoveUserFromClass;
