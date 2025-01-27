import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { login } from '@/api/authApi';
import { ApiError } from '@/types/api';
import { LoginPayload, User } from '@/types/auth';
//options?: UseMutationOptions<{ user: User; token: string }, AxiosError<ApiError>, LoginPayload>
const useLogin = () => {
    return useMutation<{ user: User; token: string }, AxiosError<ApiError>, LoginPayload>({
        mutationFn: login
    });
};
export default useLogin;
