import { z } from 'zod';

export const loginValidation = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});
export const registerValidation = loginValidation.extend({
    name: z.string()
});

export const testValidation = z.object({
    _id: z.string(),
    author: z.object({
        _id: z.string(),
        name: z.string()
    }),
    title: z.string()
});
