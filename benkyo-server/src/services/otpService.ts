const otpStore = new Map<string, { otp: string; mode: 'register' | 'forgotPassword'; tempUser?: any }>();

export const generateOTP = async (email: string, mode: 'register' | 'forgotPassword', tempUser?: any) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore.set(email, { otp, mode, tempUser });

    setTimeout(
        () => {
            otpStore.delete(email);
        },
        5 * 60 * 1000
    );

    return otp;
};

export const verifyOTP = async (email: string, otp: string) => {
    const data = otpStore.get(email);

    if (!data) {
        throw new Error('OTP not found or expired');
    }

    if (data.otp !== otp) {
        throw new Error('Invalid OTP');
    }

    const { mode, tempUser } = data;
    otpStore.delete(email);

    return { mode, tempUser };
};
