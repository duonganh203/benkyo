import { useQuery } from '@tanstack/react-query';
import { getAllNotifications } from '@/api/classApi';
import { AllNotificationsResponse } from '@/types/class';
import { ApiError } from '@/types/api';
import { AxiosError } from 'axios';

const useGetAllNotifications = () => {
    return useQuery<AllNotificationsResponse, AxiosError<ApiError>>({
        queryKey: ['all-notifications'],
        queryFn: getAllNotifications,
        refetchInterval: 5 * 60 * 1000,
        retry: 1
    });
};

export default useGetAllNotifications;
