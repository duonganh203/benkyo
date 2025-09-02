import { z } from 'zod';
import { compare, hash } from 'bcrypt';
import { BadRequestsException } from '~/exceptions/badRequests';
import { ErrorCode } from '~/exceptions/root';
import { User } from '~/schemas';
import { loginValidation, registerValidation, changePasswordValidation } from '~/validations/authValidation';
import { generateRefreshToken, generateToken } from '~/utils/generateJwt';
import * as jwt from 'jsonwebtoken';
import { UnauthorizedException } from '~/exceptions/unauthorized';

export const registerService = async (userData: z.infer<typeof registerValidation>) => {
    const { name, email, password } = userData;
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
        throw new BadRequestsException('User already exists!', ErrorCode.USER_ALREADY_EXISTS);
    }
    const hashedPassword = await hash(password, 10);
    user = await User.create({ name, email: email.toLowerCase(), password: hashedPassword });
    return user;
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
            proType: user.proType
        }
    };
};

export const refreshTokenService = async (refreshToken: string) => {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
    const newToken = generateToken((payload as any).id);
    return newToken;
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
    const hashedPassword = await hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return {
        message: 'Password changed successfully'
    };
};
