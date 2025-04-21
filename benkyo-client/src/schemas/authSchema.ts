import { z } from 'zod';

export const LoginSchema = z.object({
    email: z.string().email({ message: 'Please enter valid email address!' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters long!' })
});

export const RegisterSchema = LoginSchema.extend({
    firstName: z.string().min(1, { message: 'Must be at least 3 characters long' }),
    lastName: z.string().min(1, { message: 'Must be at least 3 characters long' })
});
