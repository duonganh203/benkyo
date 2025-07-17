import { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/types/api';
import { ClassUserResponseDto } from '@/types/class';
import { getClassListUserApi } from '@/api/classApi';

const useGetClassListUser = () => {
    return useQuery<ClassUserResponseDto[], AxiosError<ApiError>>({
        queryKey: ['classList'],
        queryFn: getClassListUserApi
    });
};

export default useGetClassListUser;
