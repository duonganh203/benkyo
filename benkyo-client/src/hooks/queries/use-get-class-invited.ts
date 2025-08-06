import { useQuery } from '@tanstack/react-query';
import { getClassInvitedApi } from '@/api/classApi';

export const useGetClassInvited = (classId: string) => {
    return useQuery({
        queryKey: ['class-invited', classId],
        queryFn: () => getClassInvitedApi(classId),
        enabled: !!classId,
        retry: false
    });
};

export default useGetClassInvited;
