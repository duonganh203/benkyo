import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { enrollUser } from '@/api/moocApi';
import { MoocInterface } from '@/types/mooc';
import { getToast } from '@/utils/getToast';

interface EnrollResponse {
    success: boolean;
    message: string;
    data?: MoocInterface;
}

interface EnrollPayload {
    moocId: string;
    userId: string;
}

const useEnrollUser = () => {
    const queryClient = useQueryClient();

    return useMutation<EnrollResponse, AxiosError, EnrollPayload>({
        mutationKey: ['enrollUser'],

        mutationFn: ({ moocId, userId }) => enrollUser(moocId, { userId }),

        onSuccess: (res, { moocId }) => {
            if (res.success) {
                getToast('success', res.message);

                queryClient.invalidateQueries({ queryKey: ['moocs', moocId] });
                queryClient.invalidateQueries({ queryKey: ['classMoocs', moocId] });
            } else {
                getToast('error', res.message);
            }
        },

        onError: (error) => {
            const msg = (error?.response?.data as any)?.message || error?.message || 'Enroll failed';
            getToast('error', msg);
        }
    });
};

export default useEnrollUser;
