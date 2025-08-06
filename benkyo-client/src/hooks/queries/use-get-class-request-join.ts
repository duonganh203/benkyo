import { useQuery } from '@tanstack/react-query';
import { classApi } from '@/api/classApi';

export const useGetClassRequestJoin = (classId: string) => {
    return useQuery({
        queryKey: ['class-request-join', classId],
        queryFn: () => classApi.getClassRequestJoin(classId),
        enabled: !!classId,
        retry: false
    });
};

export default useGetClassRequestJoin;
