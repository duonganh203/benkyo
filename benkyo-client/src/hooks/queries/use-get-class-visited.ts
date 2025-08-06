import { useQuery } from '@tanstack/react-query';
import { getClassVisitedApi } from '@/api/classApi';

export const useGetClassVisited = (classId: string) => {
    return useQuery({
        queryKey: ['class-visited', classId],
        queryFn: () => getClassVisitedApi(classId),
        enabled: !!classId,
        retry: false
    });
};

export default useGetClassVisited;
