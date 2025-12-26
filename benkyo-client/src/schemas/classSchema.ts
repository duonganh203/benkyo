import { z } from 'zod';

export const classSchema = z.object({
    _id: z
        .string()
        .regex(/^[a-f\d]{24}$/i, 'Invalid owner ID')
        .optional(),
    name: z.string().min(1, 'Class name is required').max(50, 'Class name must be at most 50 characters'),
    description: z.string().min(1, 'Description is required').max(100, 'Description must be at most 100 characters'),
    bannerUrl: z.preprocess(
        (val) => {
            if (typeof val === 'string' && val.trim() === '') return undefined;
            return val;
        },
        z.string().url({ message: 'Invalid image URL' }).optional()
    ),
    owner: z
        .string()
        .regex(/^[a-f\d]{24}$/i, 'Invalid owner ID')
        .optional(),
    visibility: z.enum(['public', 'private']),
    requiredApprovalToJoin: z.boolean(),

    visited: z
        .object({
            history: z
                .array(
                    z.object({
                        userId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid user ID'),
                        lastVisit: z.date().optional()
                    })
                )
                .optional()
        })
        .optional(),

    joinRequests: z
        .array(
            z.object({
                user: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid user ID'),
                requestDate: z.date().optional()
            })
        )
        .optional(),

    users: z.array(z.string().regex(/^[a-f\d]{24}$/i, 'Invalid user ID')).optional(),
    decks: z.array(z.string().regex(/^[a-f\d]{24}$/i, 'Invalid deck ID')).optional(),
    userClassStates: z.array(z.string().regex(/^[a-f\d]{24}$/i, 'Invalid userClassState ID')).optional()
});

export type ClassResponseDto = z.infer<typeof classSchema>;
