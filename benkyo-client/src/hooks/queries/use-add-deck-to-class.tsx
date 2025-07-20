import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { ApiError } from '@/types/api';
import { AddDeckToClassRequestDto, AddDeckToClassResponseDto } from '@/types/class';
import { addDeckToClassApi } from '@/api/classApi';
const useAddDeckToClass = () => {
    return useMutation<AddDeckToClassResponseDto, AxiosError<ApiError>, AddDeckToClassRequestDto>({
        mutationFn: addDeckToClassApi
    });
};
export default useAddDeckToClass;
