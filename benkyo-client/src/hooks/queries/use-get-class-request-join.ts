import { useInfiniteQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { getClassRequestJoinApi } from '@/api/classApi';
import type { ClassRequestJoinResponse } from '@/types/class';
import type { ApiError } from '@/types/api';

type PaginatedJoinRequests = {
    data: ClassRequestJoinResponse;
    page: number;
    hasMore: boolean;
    total: number;
};

export const useGetClassRequestJoin = (classId: string, limit: number = 5) => {
    return useInfiniteQuery<PaginatedJoinRequests, AxiosError<ApiError>>({
        queryKey: ['class-request-join', classId, limit],
        queryFn: ({ pageParam = 1 }) => getClassRequestJoinApi(classId, pageParam as number, limit),
        enabled: !!classId,
        initialPageParam: 1,
        getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined)
    });
};

export default useGetClassRequestJoin;
