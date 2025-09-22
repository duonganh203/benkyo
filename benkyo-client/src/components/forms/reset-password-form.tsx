import { GalleryVerticalEnd } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useResetPassword } from '@/hooks/queries/use-forget-password';

const ResetPasswordSchema = z
    .object({
        password: z.string().min(6, 'Password must be at least 6 characters'),
        confirmPassword: z.string()
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword']
    });

type ResetPasswordData = z.infer<typeof ResetPasswordSchema>;

export function ResetPasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
    const [isSuccess, setIsSuccess] = useState(false);
    const { mutate: resetPassword, isPending } = useResetPassword();
    const location = useLocation();
    const navigate = useNavigate();

    const email = location.state?.email;
    const otp = location.state?.otp;

    const form = useForm<ResetPasswordData>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: ''
        }
    });

    const onSubmit = (data: ResetPasswordData) => {
        if (!email || !otp) {
            alert('Missing email or OTP for reset');
            return;
        }

        resetPassword(
            { email, otp, newPassword: data.password },
            {
                onSuccess: () => {
                    setIsSuccess(true);
                    setTimeout(() => navigate('/'), 1500);
                },
                onError: (error: any) => {
                    alert(error?.response?.data?.message || 'Failed to reset password.');
                }
            }
        );
    };

    if (isSuccess) {
        return (
            <div className={cn('h-screen flex flex-col gap-6 justify-center items-center', className)} {...props}>
                <div className='flex flex-col gap-6 max-w-sm w-full'>
                    <div className='flex flex-col items-center gap-2'>
                        <div className='flex h-8 w-8 items-center justify-center rounded-md'>
                            <GalleryVerticalEnd className='size-6' />
                        </div>
                        <h1 className='text-xl font-bold'>Password reset successful</h1>
                        <div className='text-center text-sm text-muted-foreground'>
                            Your password has been successfully reset. You can now log in with your new password.
                        </div>
                    </div>
                    <div className='text-center'>
                        <Link
                            to='/login'
                            className='text-sm text-muted-foreground underline underline-offset-4 hover:text-primary'
                        >
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('h-screen flex flex-col gap-6 justify-center items-center', className)} {...props}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className='flex flex-col gap-6'>
                        <div className='flex flex-col items-center gap-2'>
                            <div className='flex h-8 w-8 items-center justify-center rounded-md'>
                                <GalleryVerticalEnd className='size-6' />
                            </div>
                            <h1 className='text-xl font-bold'>Create new password</h1>
                            <div className='text-center text-sm text-muted-foreground'>
                                Enter your new password below. Make sure it's at least 8 characters long.
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name='password'
                            render={({ field }) => (
                                <FormItem className='flex flex-col'>
                                    <div className='grid gap-2'>
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                id='password'
                                                type='password'
                                                placeholder='Enter new password'
                                                required
                                                {...field}
                                            />
                                        </FormControl>
                                    </div>
                                    <FormMessage className='mt-0' />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='confirmPassword'
                            render={({ field }) => (
                                <FormItem className='flex flex-col'>
                                    <div className='grid gap-2'>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                id='confirmPassword'
                                                type='password'
                                                placeholder='Confirm new password'
                                                required
                                                {...field}
                                            />
                                        </FormControl>
                                    </div>
                                    <FormMessage className='mt-0' />
                                </FormItem>
                            )}
                        />

                        <Button type='submit' className='w-full' disabled={isPending}>
                            {isPending ? 'Resetting...' : 'Reset password'}
                        </Button>

                        <div className='text-center'>
                            <Link
                                to='/forgot-password'
                                className='text-sm text-muted-foreground underline underline-offset-4 hover:text-primary'
                            >
                                Back to verification
                            </Link>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
}
