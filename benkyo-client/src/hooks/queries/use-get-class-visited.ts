import { useQuery } from '@tanstack/react-query';
import { classApi } from '@/api/classApi';

export const useGetClassVisited = (classId: string) => {
    return useQuery({
        queryKey: ['class-visited', classId],
        queryFn: () => classApi.getClassVisited(classId),
        enabled: !!classId,
        retry: false
    });
};

export default useGetClassVisited;
