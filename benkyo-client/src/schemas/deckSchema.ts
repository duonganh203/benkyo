import { z } from 'zod';

export const CreateDeckSchema = z.object({
    name: z.string(),
    description: z.string().optional()
});
