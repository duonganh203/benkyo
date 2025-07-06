import { z } from 'zod';

export const CreateDeckSchema = z.object({
    name: z.string(),
    description: z.string().optional()
});

export const FSRSParamsSchema = z.object({
    request_retention: z.number().min(0.1).max(1.0),
    maximum_interval: z.number().min(1).max(100000),
    w: z.array(z.number()).length(19),
    enable_fuzz: z.boolean(),
    enable_short_term: z.boolean(),
    card_limit: z.number().min(1).max(1000),
    lapses: z.number().min(1).max(100)
});
