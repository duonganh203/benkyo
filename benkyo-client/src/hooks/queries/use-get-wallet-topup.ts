import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { getTopup } from '@/api/paymentApi';
import { TopupInterface } from '@/types/payment';
import { ApiError } from '@/types/api';

const useCreateWalletTopup = () => {
    return useMutation<TopupInterface, AxiosError<ApiError>, number>({
        mutationKey: ['wallet-topup'],
        mutationFn: (price: number) => getTopup(price)
    });
};

export default useCreateWalletTopup;
