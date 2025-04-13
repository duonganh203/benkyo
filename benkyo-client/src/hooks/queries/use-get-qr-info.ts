import { useQuery } from '@tanstack/react-query';
import { getQRInformation } from '@/api/paymentApi';
import { QRInfoInterface } from '@/types/payment';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';

const useGetQRInfo = (packageId: string) => {
    return useQuery<QRInfoInterface, AxiosError<ApiError>>({
        queryKey: ['QRInfo', packageId],
        queryFn: () => getQRInformation(packageId)
    });
};

export default useGetQRInfo;
