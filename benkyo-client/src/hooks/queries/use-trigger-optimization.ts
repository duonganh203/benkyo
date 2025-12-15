import { useMutation, useQueryClient } from '@tanstack/react-query';
import { triggerOptimization } from '@/api/optimizerApi';
import { getToast } from '@/utils/getToast';

export const useTriggerOptimization = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (deckId: string) => triggerOptimization(deckId),
        onSuccess: (data, deckId) => {
            if (data.success) {
                getToast('success', data.message || 'Optimization completed successfully!');
                queryClient.invalidateQueries({ queryKey: ['optimizationStatus', deckId] });
                queryClient.invalidateQueries({ queryKey: ['deck', deckId] });
            } else {
                getToast('info', data.message || 'Optimization could not be completed.');
            }
        },
        onError: (error: Error) => {
            getToast('error', error.message || 'Failed to trigger optimization');
        }
    });
};
