import { useMutation } from '@tanstack/react-query';
import { LoginPayload, User } from '../../types/auth';
import { AxiosError } from 'axios';
import { ApiError } from '../../types/api';
import { login } from '../../api/authApi';
//options?: UseMutationOptions<{ user: User; token: string }, AxiosError<ApiError>, LoginPayload>
const useLogin = () => {
    return useMutation<{ user: User; token: string }, AxiosError<ApiError>, LoginPayload>({
        mutationFn: login
    });
};

export default useLogin;
