import { useMutation } from '@tanstack/react-query';
import { getToast } from '@/utils/getToast';
import { purchaseMooc } from '@/api/moocApi';

export default function usePurchaseMooc() {
    return useMutation({
        mutationFn: async ({ moocId }: { moocId: string }) => {
            return await purchaseMooc(moocId);
        },
        onSuccess: (data) => {
            if (data.success) {
                getToast('success', data.message || 'Purchase successful');
            } else {
                getToast('error', data.message || 'Purchase failed');
            }
        },
        onError: (error: any) => {
            const msg = (error?.response?.data as any)?.message || error?.message || 'Purchase failed';
            getToast('error', msg);
        }
    });
}
