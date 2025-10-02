import { useQuery } from '@tanstack/react-query';
import { getOverdueSchedules } from '@/api/classApi';
import { OverdueSchedule } from '@/types/class';
import { ApiError } from '@/types/api';
import { AxiosError } from 'axios';

const useGetOverdueSchedules = () => {
    return useQuery<{ data: OverdueSchedule[] }, AxiosError<ApiError>>({
        queryKey: ['overdue-schedules'],
        queryFn: getOverdueSchedules,
        refetchInterval: 5 * 60 * 1000,
        retry: 1
    });
};

export default useGetOverdueSchedules;
