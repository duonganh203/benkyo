import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { createPayout } from '@/api/paymentApi';
import { TransactionItem, PayoutRequestPayload } from '@/types/payment';
import { ApiError } from '@/types/api';

const useCreatePayout = () => {
    return useMutation<TransactionItem, AxiosError<ApiError>, PayoutRequestPayload>({
        mutationKey: ['payout-create'],
        mutationFn: (payload) => createPayout(payload)
    });
};

export default useCreatePayout;
