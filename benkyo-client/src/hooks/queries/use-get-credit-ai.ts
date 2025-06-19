import { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/types/api';
import { getCreditAI } from '@/api/limitAPi';

const useGetCreditAI = (func: string) => {
    return useQuery<any, AxiosError<ApiError>>({
        queryKey: ['creditAI', func],
        queryFn: () => getCreditAI(func)
    });
};

export default useGetCreditAI;
