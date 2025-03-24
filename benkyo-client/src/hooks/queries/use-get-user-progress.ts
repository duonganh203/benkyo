import { getUserProgress } from '@/api/progressApi';
import { ApiError } from '@/types/api';
import { UserProgressResponse } from '@/types/progress';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

const useGetUserProgress = () => {
    return useQuery<UserProgressResponse, AxiosError<ApiError>>({
        queryKey: ['progress'],
        queryFn: getUserProgress
    });
};

export default useGetUserProgress;
