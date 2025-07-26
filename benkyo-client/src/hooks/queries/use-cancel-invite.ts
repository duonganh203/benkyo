import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { useMutation } from '@tanstack/react-query';
import { cancelInviteApi } from '@/api/classApi';

interface CancelInviteParams {
    classId: string;
    userId: string;
}

const useCancelInvite = () => {
    return useMutation<{ message: string }, AxiosError<ApiError>, CancelInviteParams>({
        mutationFn: ({ classId, userId }) => cancelInviteApi(classId, userId)
    });
};

export default useCancelInvite;
