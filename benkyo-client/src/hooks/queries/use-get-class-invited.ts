import { useInfiniteQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { getClassInvitedApi } from '@/api/classApi';
import type { ClassInvitedResponse } from '@/types/class';
import type { ApiError } from '@/types/api';

type PaginatedInvited = {
    data: ClassInvitedResponse;
    page: number;
    hasMore: boolean;
    total: number;
};

export const useGetClassInvited = (classId: string, limit: number = 5) => {
    return useInfiniteQuery<PaginatedInvited, AxiosError<ApiError>>({
        queryKey: ['class-invited', classId, limit],
        queryFn: ({ pageParam = 1 }) => getClassInvitedApi(classId, pageParam as number, limit),
        enabled: !!classId,
        initialPageParam: 1,
        getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined)
    });
};

export default useGetClassInvited;
