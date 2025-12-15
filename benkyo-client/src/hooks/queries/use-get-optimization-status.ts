import { useQuery } from '@tanstack/react-query';
import { getOptimizationStatus } from '@/api/optimizerApi';

export const useGetOptimizationStatus = (deckId: string) => {
    return useQuery({
        queryKey: ['optimizationStatus', deckId],
        queryFn: () => getOptimizationStatus(deckId),
        enabled: !!deckId,
        refetchInterval: (query) => {
            // Poll every 2 seconds if optimization is running
            const status = query.state.data?.status;
            if (status === 'pending' || status === 'running') {
                return 2000;
            }
            return false;
        }
    });
};
