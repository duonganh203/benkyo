import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiError } from '../../types/api';
import { RegisterPayload } from '../../types/auth';
import { register } from '../../api/authApi';

const useRegister = () => {
    return useMutation<void, AxiosError<ApiError>, RegisterPayload>({
        mutationFn: register
    });
};

export default useRegister;
