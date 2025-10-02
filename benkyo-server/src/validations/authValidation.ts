import { z } from 'zod';

export const loginValidation = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});
export const registerValidation = loginValidation.extend({
    name: z.string()
});
export const forgotPasswordValidation = z.object({
    email: z.string().email({ message: 'Email is not valid' })
});

export const resetPasswordValidation = z.object({
    email: z.string().email(),
    otp: z.string().length(6),
    newPassword: z.string().min(6)
});

export const changePasswordValidation = z
    .object({
        oldPassword: z.string().min(6),
        newPassword: z.string().min(6),
        confirmPassword: z.string().min(6)
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword']
    });
