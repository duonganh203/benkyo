import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { RemoveUserClassRequestDto, RemoveUserClassResponseDto } from '@/types/class';
import { removeUserFromClassApi } from '@/api/classApi';

const useRemoveUserFromClass = () => {
    return useMutation<RemoveUserClassResponseDto, AxiosError<ApiError>, RemoveUserClassRequestDto>({
        mutationFn: ({ classId, userId }) => removeUserFromClassApi(classId, userId)
    });
};

export default useRemoveUserFromClass;
