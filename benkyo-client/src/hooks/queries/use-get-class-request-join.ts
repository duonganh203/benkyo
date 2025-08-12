import { useQuery } from '@tanstack/react-query';
import { getClassRequestJoinApi } from '@/api/classApi';

export const useGetClassRequestJoin = (classId: string) => {
    return useQuery({
        queryKey: ['class-request-join', classId],
        queryFn: () => getClassRequestJoinApi(classId),
        enabled: !!classId,
        retry: false
    });
};

export default useGetClassRequestJoin;
