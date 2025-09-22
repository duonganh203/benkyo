import { GalleryVerticalEnd } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OtpModal } from '../modals/otp-modal';
import { useForgotPassword } from '@/hooks/queries/use-forget-password';

const ForgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address')
});

type ForgotPasswordData = z.infer<typeof ForgotPasswordSchema>;

const getToast = (type: string, message: string) => {
    console.log(`${type}: ${message}`);
};

export function ForgotPasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
    const { mutate: forgotPassword, isPending } = useForgotPassword();
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState('');
    const navigate = useNavigate();

    const form = useForm<ForgotPasswordData>({
        resolver: zodResolver(ForgotPasswordSchema),
        defaultValues: {
            email: ''
        }
    });

    const onSubmit = (data: ForgotPasswordData) => {
        forgotPassword(data, {
            onSuccess: () => {
                setSubmittedEmail(data.email);
                setShowOtpModal(true);
                getToast('success', 'OTP sent to your email!');
            },
            onError: (error) => {
                getToast('error', error.response?.data?.message || 'Something went wrong!');
            }
        });
    };

    const handleOtpVerifySuccess = () => {
        setShowOtpModal(false);
        navigate('/reset-password', { state: { email: submittedEmail } });
    };

    return (
        <>
            <div className={cn('h-screen flex flex-col gap-6 justify-center items-center', className)} {...props}>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className='flex flex-col gap-6'>
                            <div className='flex flex-col items-center gap-2'>
                                <a href='#' className='flex flex-col items-center gap-2 font-medium'>
                                    <div className='flex h-8 w-8 items-center justify-center rounded-md'>
                                        <GalleryVerticalEnd className='size-6' />
                                    </div>
                                    <span className='sr-only'>Benkyo</span>
                                </a>
                                <h1 className='text-xl font-bold'>Reset your password</h1>
                                <div className='text-center text-sm text-muted-foreground'>
                                    Enter your email address and we'll send you a verification code.
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
                            <Button type='submit' className='w-full' disabled={isPending}>
                                {isPending ? 'Sending...' : 'Send verification code'}
                            </Button>
                            <div className='text-center'>
                                <Link
                                    to='/login'
                                    className='text-sm text-muted-foreground underline underline-offset-4 hover:text-primary'
                                >
                                    Back to login
                                </Link>
                            </div>
                        </div>
                    </form>
                </Form>
            </div>

            <OtpModal
                isOpen={showOtpModal}
                onClose={() => setShowOtpModal(false)}
                email={submittedEmail}
                onVerifySuccess={handleOtpVerifySuccess}
            />
        </>
    );
}

export default function ForgotPasswordPage() {
    return <ForgotPasswordForm />;
}
