import { z } from 'zod';

export const CardSchema = z.object({
    front: z.string().min(1, "Question can't be empty"),
    back: z.string().min(1, "Answer can't be empty"),
    tags: z.array(z.string())
});
