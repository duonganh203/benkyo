import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { ApiError } from '@/types/api';
import { User } from '@/types/auth';
import { updateUserPayload } from '@/types/user';
import { updateUser } from '@/api/userApi';
const useUpdateUser = () => {
    return useMutation<User, AxiosError<ApiError>, updateUserPayload>({
        mutationFn: updateUser
    });
};
export default useUpdateUser;
