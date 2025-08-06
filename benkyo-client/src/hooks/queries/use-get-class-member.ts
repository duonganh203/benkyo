import { useQuery } from '@tanstack/react-query';
import { classApi } from '@/api/classApi';

export const useGetClassMember = (classId: string) => {
    return useQuery({
        queryKey: ['class-member', classId],
        queryFn: () => classApi.getClassMember(classId),
        enabled: !!classId,
        retry: false
    });
};

export default useGetClassMember;
