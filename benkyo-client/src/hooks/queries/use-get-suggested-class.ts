import { useInfiniteQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ClassListItemUserResponseDto } from '@/types/class';
import { ApiError } from '@/types/api';
import { getSuggestedClassApi } from '@/api/classApi';

type PaginatedClassList = {
    data: ClassListItemUserResponseDto[];
    hasMore: boolean;
};

const useGetSuggestedClass = (search?: string) => {
    return useInfiniteQuery<PaginatedClassList, AxiosError<ApiError>>({
        queryKey: ['suggestedClasses', search],
        queryFn: ({ pageParam = 1 }) => getSuggestedClassApi(pageParam as number, search, 6),
        initialPageParam: 1,
        getNextPageParam: (lastPage: PaginatedClassList, allPages: PaginatedClassList[]) =>
            lastPage.hasMore ? allPages.length + 1 : undefined,
        retry: 1
    });
};

export default useGetSuggestedClass;
