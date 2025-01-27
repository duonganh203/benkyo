import { register } from '@/api/authApi';
import { ApiError } from '@/types/api';
import { RegisterPayload } from '@/types/auth';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

const useRegister = () => {
    return useMutation<void, AxiosError<ApiError>, RegisterPayload>({
        mutationFn: register
    });
};

export default useRegister;
