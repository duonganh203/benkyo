import { useMutation } from '@tanstack/react-query';
import { updateDeckFsrsParams } from '@/api/deckApi';
import { FSRSParamsSchema } from '@/schemas/deckSchema';
import { z } from 'zod';

interface UpdateDeckFsrsParamsInput {
    deckId: string;
    fsrsParams: z.infer<typeof FSRSParamsSchema>;
}

export const useUpdateDeckFsrsParams = () => {
    return useMutation({
        mutationFn: ({ deckId, fsrsParams }: UpdateDeckFsrsParamsInput) => updateDeckFsrsParams(deckId, fsrsParams)
    });
};
