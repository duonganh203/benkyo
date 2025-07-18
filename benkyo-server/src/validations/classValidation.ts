import z from 'zod';

export const classValidation = z.object({
    _id: z
        .string()
        .regex(/^[a-f\d]{24}$/i, 'Invalid class ID')
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
        .array(
            z.object({
                userId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid user ID'),
                count: z.number().nonnegative().default(0),
                lastVisit: z.date().optional()
            })
        )
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
    desks: z.array(z.string().regex(/^[a-f\d]{24}$/i, 'Invalid deck ID')).optional(),
    userClassStates: z.array(z.string().regex(/^[a-f\d]{24}$/i, 'Invalid userClassState ID')).optional()
});

export type ClassStateType = z.infer<typeof classValidation>;
