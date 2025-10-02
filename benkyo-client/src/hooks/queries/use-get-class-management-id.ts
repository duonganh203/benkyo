import { getClassManagementByIdApi } from '@/api/classApi';
import { ApiError } from '@/types/api';
import { ClassManagementResponseDto } from '@/types/class';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

const useGetClassManagementById = (classId: string) => {
    return useQuery<ClassManagementResponseDto, AxiosError<ApiError>>({
        queryKey: ['classId', classId],
        queryFn: () => getClassManagementByIdApi(classId),
        enabled: !!classId
    });
};

export default useGetClassManagementById;
