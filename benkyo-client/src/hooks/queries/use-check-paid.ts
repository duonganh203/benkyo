import { useQuery } from '@tanstack/react-query';
import { checkIsPaid } from '@/api/paymentApi';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { IsPaidInterface } from '@/types/payment';

const useCheckIsPaid = (transactionId: string) => {
    return useQuery<IsPaidInterface, AxiosError<ApiError>>({
        queryKey: ['IsPaid', transactionId],
        queryFn: () => checkIsPaid(transactionId),
        enabled: !!transactionId
    });
};

export default useCheckIsPaid;
