import { GalleryVerticalEnd } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { AxiosError } from 'axios';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useLogin from '@/hooks/queries/use-login';
import useAuthStore from '@/hooks/stores/use-auth-store';
import { LoginSchema } from '@/schemas/authSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApiError } from '@/types/api';
import { getToast } from '@/utils/getToast';

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
    const { mutate: login, isPending } = useLogin();
    const { setUser, setToken, setRefreshToken } = useAuthStore();
    const [error, setError] = useState<AxiosError<ApiError>>();

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    });

    const onSubmit = (data: z.infer<typeof LoginSchema>) => {
        login(data, {
            onSuccess: (data) => {
                setUser(data.user);
                setToken(data.token);
                setRefreshToken(data.refreshToken);
                getToast('success', 'Login successful!!!');
            },
            onError: (error) => {
                getToast('error', error.message || 'Something went wrong!!!');
                setError(error);
            }
        });
    };
    const onGoogleLogin = (e: React.MouseEvent) => {
        e.preventDefault();
        const googleAuthUrl = `${import.meta.env.VITE_API_URL}/auth/google`;
        window.location.href = googleAuthUrl;
    };

    return (
        <div
            className={cn('relative min-h-screen w-full px-4 py-10 flex items-center justify-center', className)}
            {...props}
        >
            <div className='absolute inset-0' />
            <div className='relative z-10 w-full max-w-md overflow-hidden rounded-2xl border bg-card/90 shadow-2xl shadow-primary/10 backdrop-blur-xl'>
                <div className='p-8 sm:p-10'>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className='flex flex-col gap-6'>
                                <div className='flex flex-col items-center gap-2 text-center'>
                                    <a href='#' className='flex flex-col items-center gap-2 font-medium'>
                                        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                                            <GalleryVerticalEnd className='size-6' />
                                        </div>
                                        <span className='sr-only'>Benkyo</span>
                                    </a>
                                    <h1 className='text-2xl font-bold'>Welcome to Benkyo.</h1>
                                    <div className='text-sm text-muted-foreground'>
                                        Don&apos;t have an account?{' '}
                                        <Link to='/register' className='underline underline-offset-4'>
                                            Register
                                        </Link>
                                    </div>
                                </div>
                                <FormField
                                    control={form.control}
                                    name='email'
                                    render={({ field }) => (
                                        <FormItem className='flex flex-col'>
                                            <div className='grid gap-2'>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        id='email'
                                                        type='email'
                                                        placeholder='m@example.com'
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
                                    name='password'
                                    render={({ field }) => (
                                        <FormItem className='flex flex-col'>
                                            <div className='grid gap-2'>
                                                <div className='flex items-center justify-between'>
                                                    <FormLabel>Password</FormLabel>
                                                    <Link
                                                        to='/forgotPassword'
                                                        className='text-sm text-muted-foreground underline underline-offset-4 hover:text-primary'
                                                    >
                                                        Forgot password?
                                                    </Link>
                                                </div>
                                                <FormControl>
                                                    <Input
                                                        id='password'
                                                        type='password'
                                                        placeholder='**********'
                                                        required
                                                        {...field}
                                                    />
                                                </FormControl>
                                            </div>
                                            <FormMessage>{error && error.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                                <Button type='submit' className='w-full' disabled={isPending}>
                                    Login
                                </Button>
                                <div className='relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border'>
                                    <span className='relative z-10 bg-card px-2 text-muted-foreground'>Or</span>
                                </div>
                                <Button onClick={(e) => onGoogleLogin(e)} variant='outline' className=''>
                                    <svg xmlns='http:www.w3.org/2000/svg' viewBox='0 0 24 24'>
                                        <path
                                            d='M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z'
                                            fill='currentColor'
                                        />
                                    </svg>
                                    Continue with Google
                                </Button>
                            </div>
                        </form>
                    </Form>
                    <div className='mt-6 text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary'>
                        By clicking continue, you agree to our <a href='#'>Terms of Service</a> and{' '}
                        <a href='#'>Privacy Policy</a>.
                    </div>
                </div>
            </div>
        </div>
    );
}
