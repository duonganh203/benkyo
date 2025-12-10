import { useQuery } from '@tanstack/react-query';
import { getTransactions } from '@/api/paymentApi';
import { TransactionItem } from '@/types/payment';

const useTransactions = () => {
    return useQuery<TransactionItem[]>({
        queryKey: ['transactions'],
        queryFn: () => getTransactions()
    });
};

export default useTransactions;
