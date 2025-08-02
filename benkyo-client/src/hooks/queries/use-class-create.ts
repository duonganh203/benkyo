import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { ApiError } from '@/types/api';
import { ClassUserRequestDto, ClassUserResponseDto } from '@/types/class';
import { createClassApi } from '@/api/classApi';
const useClassCreate = () => {
    return useMutation<ClassUserResponseDto, AxiosError<ApiError>, ClassUserRequestDto>({
        mutationFn: createClassApi
    });
};
export default useClassCreate;
