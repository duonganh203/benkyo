import { z } from 'zod';

export const classSchema = z.object({
    _id: z
        .string()
        .regex(/^[a-f\d]{24}$/i, 'Invalid owner ID')
        .optional(),
    name: z.string().min(1, 'Class name is required'),
    description: z.string().min(1, 'Description is required'),
    bannerUrl: z.string().url({ message: 'Invalid image URL' }).min(1, 'Banner is required'),
    owner: z
        .string()
        .regex(/^[a-f\d]{24}$/i, 'Invalid owner ID')
        .optional(),
    visibility: z.enum(['public', 'private']),
    requiredApprovalToJoin: z.boolean(),

    visited: z
        .object({
            count: z.number().nonnegative().default(0),
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
