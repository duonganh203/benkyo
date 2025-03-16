import { z } from 'zod';
export const updateUserValidation = z.object({
    name: z.string().optional(),
    avatar: z.string().optional()
});
