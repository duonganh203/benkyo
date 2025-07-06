import { useMutation } from '@tanstack/react-query';
import { updateDeckFsrsParams } from '@/api/deckApi';

interface UpdateDeckFsrsParamsInput {
    deckId: string;
    fsrsParams: {
        request_retention?: number;
        maximum_interval?: number;
        w?: number[];
        enable_fuzz?: boolean;
        enable_short_term?: boolean;
        card_limit?: number;
        lapses?: number;
    };
}

export const useUpdateDeckFsrsParams = () => {
    return useMutation({
        mutationFn: ({ deckId, fsrsParams }: UpdateDeckFsrsParamsInput) => updateDeckFsrsParams(deckId, fsrsParams)
    });
};
