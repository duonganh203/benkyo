import { useQuery } from '@tanstack/react-query';
import { getClassMemberApi } from '@/api/classApi';

export const useGetClassMember = (classId: string) => {
    return useQuery({
        queryKey: ['class-member', classId],
        queryFn: () => getClassMemberApi(classId),
        enabled: !!classId,
        retry: false
    });
};

export default useGetClassMember;
