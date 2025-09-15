const otpStore = new Map<string, string>();

export const generateOTP = async (email: string) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore.set(email, otp);

    setTimeout(
        () => {
            otpStore.delete(email);
        },
        5 * 60 * 1000
    );

    return otp;
};

export const verifyOTP = async (email: string, otp: string) => {
    const storedOtp = otpStore.get(email);

    if (!storedOtp) {
        throw new Error('OTP not found or expired');
    }

    if (storedOtp !== otp) {
        throw new Error('Invalid OTP');
    }

    otpStore.delete(email);
};
