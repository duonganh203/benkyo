import 'dotenv/config';
import { compare, hash } from 'bcrypt';
import { Request, Response } from 'express';
import { sign } from 'jsonwebtoken';
import { User } from '~/schemas/userSchema';
import { BadRequestsException } from '~/exceptions/badRequests';
import { ErrorCode } from '~/exceptions/root';
import { registerValidation } from '~/validations/authValidation';
import { UnprocessableEntity } from '~/exceptions/unprocessableEntity';

export const register = async (req: Request, res: Response) => {
    const { error } = registerValidation.validate(req.body);
    if (error) throw new UnprocessableEntity(error, 'Unprocessable entity', ErrorCode.UNPROCESSALE_ENTITY);

    const { name, password, email } = req.body;

    let user = await User.findOne({ email });

    if (user) throw new BadRequestsException('User already exists!', ErrorCode.USER_ALREADY_EXISTS);
    const hashedPassword = await hash(password, 10);
    user = await User.create({ name, email, password: hashedPassword });
    res.json(user);
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const JWT_SECRET = process.env.JWT_SECRET;

    const user = await User.findOne({ email });
    if (!user) throw new BadRequestsException('Email or password is not correct!', ErrorCode.INVALID_CREDENTIALS);

    const isMatch = await compare(password, user.password);
    if (!isMatch) throw new BadRequestsException('Email or password is not correct!', ErrorCode.INVALID_CREDENTIALS);

    const token = sign({ id: user._id }, JWT_SECRET!, {
        expiresIn: '24h'
    });
    res.json({ token, user: { id: user._id, username: user.name, email: user.email } });
};

export const me = async (req: Request, res: Response) => {
    res.json(req.user);
};
