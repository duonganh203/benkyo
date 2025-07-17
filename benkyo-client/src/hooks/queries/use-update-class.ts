import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { ClassUserRequestDto, ClassUserResponseDto } from '@/types/class';
import { updateClassApi } from '@/api/classApi';

type ClassUserRequestUpdateDto = {
    _id: string;
    data: ClassUserRequestDto;
};

const useUpdateClass = () => {
    return useMutation<ClassUserResponseDto, AxiosError<ApiError>, ClassUserRequestUpdateDto>({
        mutationFn: ({ _id, data }) => updateClassApi(_id, data)
    });
};

export default useUpdateClass;
