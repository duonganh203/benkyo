import { useInfiniteQuery } from '@tanstack/react-query';
import { getClassVisitedApi } from '@/api/classApi';
import type { ClassVisitedResponse } from '@/types/class';
import type { ApiError } from '@/types/api';
import type { AxiosError } from 'axios';

export type PaginatedVisited = {
    data: ClassVisitedResponse;
    page: number;
    hasMore: boolean;
    total: number;
};

export const useGetClassVisited = (classId: string, limit: number = 10) => {
    return useInfiniteQuery<PaginatedVisited, AxiosError<ApiError>>({
        queryKey: ['class-visited', classId, limit],
        queryFn: ({ pageParam = 1 }) => getClassVisitedApi(classId, pageParam as number, limit),
        enabled: !!classId,
        initialPageParam: 1,
        getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined)
    });
};

export default useGetClassVisited;
