import { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/types/api';
import { ClassNotification } from '@/types/notification';
import { getInviteClassApi } from '@/api/classApi';

const useGetInviteClass = () => {
    return useQuery<ClassNotification[], AxiosError<ApiError>>({
        queryKey: ['inviteClass'],
        queryFn: getInviteClassApi
    });
};

export default useGetInviteClass;
