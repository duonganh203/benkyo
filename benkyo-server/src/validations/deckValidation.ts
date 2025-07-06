import z from 'zod';

export const createDeckValidation = z.object({
    name: z.string(),
    description: z.string().optional()
});

export const updateDeckFsrsParamsValidation = z.object({
    request_retention: z.number().min(0.1).max(1.0).optional(),
    maximum_interval: z.number().min(1).max(100000).optional(),
    w: z.array(z.number()).length(19).optional(),
    enable_fuzz: z.boolean().optional(),
    enable_short_term: z.boolean().optional(),
    card_limit: z.number().min(1).max(1000).optional(),
    lapses: z.number().min(1).max(100).optional()
});
