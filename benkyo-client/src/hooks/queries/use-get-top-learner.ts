import { useQuery } from '@tanstack/react-query';

import { getTopLearningStreaks } from '@/api/streakApi';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { User } from '@/types/user';

const useGetTopLearner = () => {
    return useQuery<User[], AxiosError<ApiError>>({
        queryKey: ['topLearners'],
        queryFn: getTopLearningStreaks
    });
};

export default useGetTopLearner;
