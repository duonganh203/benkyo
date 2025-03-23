import z from 'zod';

export const mediaItemSchema = z.object({
    type: z.enum(['image', 'audio', 'video']),
    url: z.string().url(),
    filename: z.string().optional()
});

export const createCardValidation = z.object({
    front: z.string().min(1, 'Front content is required'),
    back: z.string().min(1, 'Back content is required'),
    tags: z.array(z.string()).optional().default([]),
    deckId: z.string().min(1, 'Deck ID is required'),
    media: z.array(mediaItemSchema).optional().default([])
});

export const batchCreateCardsValidation = z.object({
    cards: z
        .array(
            z.object({
                front: z.string().min(1, 'Front content is required'),
                back: z.string().min(1, 'Back content is required'),
                tags: z.array(z.string()).optional().default([]),
                media: z.array(mediaItemSchema).optional().default([])
            })
        )
        .min(1, 'At least one card is required'),
    deckId: z.string().min(1, 'Deck ID is required')
});
