import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { ApiError } from '@/types/api';
import { ForgotPasswordPayload, ResetPasswordPayload, VerifyOtpPayload } from '@/types/auth';
import { forgotPassword, resetPassword, verifyOtp } from '@/api/authApi';

export const useForgotPassword = () => {
    return useMutation<{ message: string }, AxiosError<ApiError>, ForgotPasswordPayload>({
        mutationFn: forgotPassword
    });
};

export const useResetPassword = () => {
    return useMutation<{ message: string }, AxiosError<ApiError>, ResetPasswordPayload>({ mutationFn: resetPassword });
};
export const useVerifyOtp = () => {
    return useMutation<{ message: string }, AxiosError<ApiError>, VerifyOtpPayload>({
        mutationFn: verifyOtp
    });
};
