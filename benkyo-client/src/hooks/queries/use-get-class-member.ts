import { useInfiniteQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { getClassMemberApi } from '@/api/classApi';
import type { ClassMembersResponse } from '@/types/class';
import type { ApiError } from '@/types/api';

type PaginatedMembers = {
    data: ClassMembersResponse;
    page: number;
    hasMore: boolean;
    total: number;
};

export const useGetClassMember = (classId: string, limit: number = 5) => {
    return useInfiniteQuery<PaginatedMembers, AxiosError<ApiError>>({
        queryKey: ['class-member', classId, limit],
        queryFn: ({ pageParam = 1 }) => getClassMemberApi(classId, pageParam as number, limit),
        enabled: !!classId,
        initialPageParam: 1,
        getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined)
    });
};

export default useGetClassMember;
