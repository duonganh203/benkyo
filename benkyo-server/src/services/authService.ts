import { z } from 'zod';
import { compare, hash } from 'bcrypt';
import { BadRequestsException } from '~/exceptions/badRequests';
import { ErrorCode } from '~/exceptions/root';
import { User } from '~/schemas';
import { loginValidation, registerValidation } from '~/validations/authValidation';
import { generateRefreshToken, generateToken } from '~/utils/generateJwt';
import * as jwt from 'jsonwebtoken';

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

export const loginService = async (userData: z.infer<typeof loginValidation>) => {
    const { email, password } = userData;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new BadRequestsException('Email or password is not correct!', ErrorCode.INVALID_CREDENTIALS);
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
