import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { ClassUserRequestDto, ClassUserResponseDto } from '@/types/class';
import { updateClassApi } from '@/api/classApi';

type ClassUserRequestUpdateDto = {
    classId: string;
    requestClass: ClassUserRequestDto;
};

const useUpdateClass = () => {
    return useMutation<ClassUserResponseDto, AxiosError<ApiError>, ClassUserRequestUpdateDto>({
        mutationFn: ({ classId, requestClass }) => updateClassApi(classId, requestClass)
    });
};

export default useUpdateClass;
