import { getAllPackages } from '@/api/paymentApi';
import { PackageInterface } from '@/types/payment';
import { useSuspenseQuery } from '@tanstack/react-query';

const useGetPackages = () => {
    return useSuspenseQuery<PackageInterface[]>({
        queryKey: ['packages'],
        queryFn: () => getAllPackages()
    });
};

export default useGetPackages;
