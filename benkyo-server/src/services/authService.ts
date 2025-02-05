import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { BadRequestsException } from '~/exceptions/badRequests';
import { ErrorCode } from '~/exceptions/root';
import { UnprocessableEntity } from '~/exceptions/unprocessableEntity';
import { User } from '~/schemas/userSchema';
import { loginValidation, registerValidation } from '~/validations/authValidation';
import { z } from 'zod';
export const registerService = async (userData: z.infer<typeof registerValidation>) => {
    const { name, email, password } = userData;
    let user = await User.findOne({ email });
    if (user) {
        throw new BadRequestsException('User already exists!', ErrorCode.USER_ALREADY_EXISTS);
    }
    const hashedPassword = await hash(password, 10);
    user = await User.create({ name, email, password: hashedPassword });

    return user;
};

export const loginService = async (userData: z.infer<typeof loginValidation>) => {
    const JWT_SECRET = process.env.JWT_SECRET;
    const { email, password } = userData;
    const user = await User.findOne({ email });
    if (!user) throw new BadRequestsException('Email or password is not correct!', ErrorCode.INVALID_CREDENTIALS);

    const isMatch = await compare(password, user.password);
    if (!isMatch) throw new BadRequestsException('Email or password is not correct!', ErrorCode.INVALID_CREDENTIALS);

    const token = sign({ id: user._id }, JWT_SECRET!, {
        expiresIn: '24h'
    });
    return { token, user: { id: user._id, username: user.name, email: user.email } };
};
