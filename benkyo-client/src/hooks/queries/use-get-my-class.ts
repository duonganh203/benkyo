import { useInfiniteQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { getMyClassApi } from '@/api/classApi';
import { ClassListItemUserResponseDto } from '@/types/class';
import { ApiError } from '@/types/api';

type PaginatedClassList = {
    data: ClassListItemUserResponseDto[];
    hasMore: boolean;
};

const useGetMyClass = (search?: string) => {
    return useInfiniteQuery<PaginatedClassList, AxiosError<ApiError>>({
        queryKey: ['myClasses', search],
        queryFn: ({ pageParam = 1 }) => getMyClassApi(pageParam as number, search, 6),
        initialPageParam: 1,
        getNextPageParam: (lastPage: PaginatedClassList, allPages: PaginatedClassList[]) =>
            lastPage.hasMore ? allPages.length + 1 : undefined,
        retry: 1
    });
};

export default useGetMyClass;
