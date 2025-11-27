import { z } from 'zod';
import { compare, hash } from 'bcrypt';
import { BadRequestsException } from '~/exceptions/badRequests';
import { ErrorCode } from '~/exceptions/root';
import { User } from '~/schemas';
import {
    loginValidation,
    registerValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
    changePasswordValidation
} from '~/validations/authValidation';
import { generateRefreshToken, generateToken } from '~/utils/generateJwt';
import * as jwt from 'jsonwebtoken';
import { UnauthorizedException } from '~/exceptions/unauthorized';
import { sendOTPEmail } from '~/utils//mailService';
import { generateOTP, verifyOTP } from './otpService';

export const registerService = async (userData: z.infer<typeof registerValidation>) => {
    const { name, email, password } = userData;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        throw new BadRequestsException('User already exists!', ErrorCode.USER_ALREADY_EXISTS);
    }

    const hashedPassword = await hash(password, 10);
    const otp = await generateOTP(email, 'register', {
        name,
        email: email.toLowerCase(),
        password: hashedPassword
    });
    await sendOTPEmail(email, otp);

    return {
        message: 'OTP has been sent to your email!'
    };
};

export const loginService = async (userData: z.infer<typeof loginValidation>, options?: { isAdmin?: boolean }) => {
    const { email, password } = userData;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new BadRequestsException('Email or password is not correct!', ErrorCode.INVALID_CREDENTIALS);
    if (options?.isAdmin && user.role !== 'admin') {
        throw new UnauthorizedException('You are not authorized as an admin!', ErrorCode.UNAUTHORIZED);
    }
    const isMatch = await compare(password, user.password);
    if (!isMatch) throw new BadRequestsException('Email or password is not correct!', ErrorCode.INVALID_CREDENTIALS);
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    return {
        token,
        refreshToken,
        user: {
            id: user._id,
            username: user.name,
            email: user.email,
            avatar: user.avatar,
            isPro: user.isPro,
            proType: user.proType,
            balance: user.balance ?? 0
        }
    };
};

export const refreshTokenService = async (refreshToken: string) => {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
    const newToken = generateToken((payload as any).id);
    return newToken;
};

export const forgotPasswordService = async (email: string) => {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new Error('User not found!');

    const otp = await generateOTP(user.email, 'forgotPassword');
    await sendOTPEmail(user.email, otp);

    return { message: 'OTP has been sent to your email!' };
};

export const verifyOtpService = async (email: string, otp: string) => {
    const { mode, tempUser } = await verifyOTP(email, otp);

    if (mode === 'register' && tempUser) {
        const user = await User.create(tempUser);
        return { message: 'Account created successfully!', user };
    }

    if (mode === 'forgotPassword') {
        return { message: 'OTP verified successfully! You can now reset your password.' };
    }

    return { message: 'OTP verified successfully!' };
};

export const resetPasswordService = async (email: string, newPassword: string) => {
    if (!email || !newPassword) {
        return { success: false, message: 'Missing required fields' };
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        throw new BadRequestsException('User not found', ErrorCode.NOT_FOUND);
    }

    user.password = await hash(newPassword, 10);
    await user.save();

    return { message: 'Password reset successfully!' };
};
export const changePasswordService = async (userId: string, data: z.infer<typeof changePasswordValidation>) => {
    const { oldPassword, newPassword, confirmPassword } = data;
    const user = await User.findById(userId);
    if (!user) {
        throw new UnauthorizedException('User not found!', ErrorCode.UNAUTHORIZED);
    }
    const isMatch = await compare(oldPassword, user.password);
    if (!isMatch) {
        throw new BadRequestsException('Old password is not correct!', ErrorCode.INVALID_CREDENTIALS);
    }
    if (newPassword !== confirmPassword) {
        throw new BadRequestsException(
            'New password and confirm password do not match!',
            ErrorCode.INVALID_CREDENTIALS
        );
    }
    const isSameAsOld = await compare(newPassword, user.password);
    if (isSameAsOld) {
        throw new BadRequestsException(
            'New password cannot be the same as the old password!',
            ErrorCode.INVALID_CREDENTIALS
        );
    }

    const hashedPassword = await hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return {
        message: 'Password changed successfully'
    };
};
