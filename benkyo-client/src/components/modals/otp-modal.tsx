import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useVerifyOtp } from '@/hooks/queries/use-forget-password';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface OtpModalProps {
    isOpen: boolean;
    onClose: () => void;
    email: string;
}

export function OtpModal({ isOpen, onClose, email }: OtpModalProps) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const { mutate: verifyOtp, isPending } = useVerifyOtp();
    const navigate = useNavigate();

    const resetOtpInputs = () => {
        setOtp(['', '', '', '', '', '']);
        setError('');
        inputRefs.current[0]?.focus();
    };

    useEffect(() => {
        if (isOpen) {
            inputRefs.current[0]?.focus();
        } else {
            // 👉 Khi modal đóng thì clear OTP
            resetOtpInputs();
        }
    }, [isOpen]);

    const handleInputChange = (index: number, value: string) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        verifyOtp(
            { otp: otpCode, email },
            {
                onSuccess: () => {
                    toast.success('OTP verified successfully!');
                    onClose();
                    navigate('/resetPassword', { state: { email, otp: otpCode } });
                },
                onError: (error: any) => {
                    const message = error.response?.data?.message || 'Invalid OTP code';
                    setError(message);
                    toast.error(message);
                    resetOtpInputs(); // 👉 reset khi nhập sai
                }
            }
        );
    };

    const handleResend = () => {
        toast.success('New OTP sent to your email!');
        resetOtpInputs();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                    <DialogTitle>Enter verification code</DialogTitle>
                    <DialogDescription>We&apos;ve sent a 6-digit verification code to {email}</DialogDescription>
                </DialogHeader>

                <div className='flex flex-col gap-4'>
                    <div className='flex gap-2 justify-center'>
                        {otp.map((digit, index) => (
                            <Input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type='text'
                                inputMode='numeric'
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleInputChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className='w-12 h-12 text-center text-lg font-semibold'
                                placeholder='0'
                            />
                        ))}
                    </div>

                    {error && <p className='text-sm text-red-500 text-center'>{error}</p>}

                    <Button
                        onClick={handleVerify}
                        disabled={isPending || otp.some((digit) => !digit)}
                        className='w-full'
                    >
                        {isPending ? 'Verifying...' : 'Verify Code'}
                    </Button>

                    <div className='text-center'>
                        <button
                            type='button'
                            onClick={handleResend}
                            className='text-sm text-muted-foreground underline underline-offset-4 hover:text-primary'
                        >
                            Didn&apos;t receive the code? Resend
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
