import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { getClassMemberProgressApi } from '@/api/classApi';
import { MemberProgress } from '@/types/class';
import { ApiError } from '@/types/api';

const useGetClassMemberProgress = (classId: string) => {
    return useQuery<MemberProgress[], AxiosError<ApiError>>({
        queryKey: ['class-member-progress', classId],
        queryFn: () => getClassMemberProgressApi(classId),
        enabled: !!classId
    });
};

export default useGetClassMemberProgress;
