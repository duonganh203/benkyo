import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { ApiError } from '@/types/api';
import { changePassword } from '@/api/authApi';
import { ChangePasswordPayload } from '@/types/auth';

const useChangePassword = () => {
    return useMutation<void, AxiosError<ApiError>, ChangePasswordPayload>({
        mutationFn: (payload) => changePassword(payload)
    });
};

export default useChangePassword;
