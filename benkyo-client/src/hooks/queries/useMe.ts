import { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { me } from '@/api/authApi';
import { ApiError } from '@/types/api';
import { User } from '@/types/auth';
const useMe = () => {
    return useQuery<User, AxiosError<ApiError>>({
        queryKey: ['me'],
        queryFn: me
    });
};
export default useMe;
