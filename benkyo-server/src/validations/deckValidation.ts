import z from 'zod';

export const createDeckValidation = z.object({
    name: z.string(),
    description: z.string().optional()
});
