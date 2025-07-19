import { getClassManagemenById } from '@/api/classApi';
import { ApiError } from '@/types/api';
import { ClassManagementResponseDto } from '@/types/class';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

const useGetClassManagemenById = (classId: string) => {
    return useQuery<ClassManagementResponseDto, AxiosError<ApiError>>({
        queryKey: ['classId', classId],
        queryFn: () => getClassManagemenById(classId),
        enabled: !!classId
    });
};

export default useGetClassManagemenById;
