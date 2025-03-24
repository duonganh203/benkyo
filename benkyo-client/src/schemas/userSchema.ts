import { z } from 'zod';

export const updateProfileSchema = z.object({
    name: z.string().min(6),
    email: z.string().email()
});
