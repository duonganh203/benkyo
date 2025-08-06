import { useQuery } from '@tanstack/react-query';
import { classApi } from '@/api/classApi';

export const useGetClassInvited = (classId: string) => {
    return useQuery({
        queryKey: ['class-invited', classId],
        queryFn: () => classApi.getClassInvited(classId),
        enabled: !!classId,
        retry: false
    });
};

export default useGetClassInvited;
