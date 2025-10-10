import { useMutation } from '@tanstack/react-query';
import { createMooc } from '@/api/moocApi';
import type { CreateMoocPayload, MoocInterface } from '@/types/mooc';

export const useCreateMooc = (classId: string) => {
    return useMutation<{ success: boolean; message: string; data: MoocInterface }, Error, CreateMoocPayload>({
        mutationFn: (payload) => createMooc(classId, payload)
    });
};
