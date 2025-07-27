import { useQuery } from '@tanstack/react-query';
import { getUpcomingDeadlines } from '@/api/classApi';
import { UpcomingDeadline } from '@/types/class';
import { ApiError } from '@/types/api';
import { AxiosError } from 'axios';

const useGetUpcomingDeadlines = () => {
    return useQuery<{ data: UpcomingDeadline[] }, AxiosError<ApiError>>({
        queryKey: ['upcoming-deadlines'],
        queryFn: getUpcomingDeadlines,
        refetchInterval: 5 * 60 * 1000,
        retry: 1
    });
};

export default useGetUpcomingDeadlines;
