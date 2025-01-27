import 'dotenv/config';
import { compare, hash } from 'bcrypt';
import { Request, Response } from 'express';
import { sign } from 'jsonwebtoken';
import { User } from '~/schemas/user';

export const register = async (req: Request, res: Response) => {
    const { username, password, email } = req.body;

    let user = await User.findOne({ email, username });

    if (user) throw Error('User already exists!');

    const hashedPassword = await hash(password, 10);
    user = await User.create({ username, email, password: hashedPassword });
    res.json(user);
};

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const JWT_SECRET = process.env.JWT_SECRET;

    const user = await User.findOne({ username });
    if (!user) throw Error('Username or password is not correct!');

    const isMatch = await compare(password, user.password);
    if (!isMatch) throw Error('Username or password is not correct!');

    const token = sign({ id: user._id }, JWT_SECRET!, {
        expiresIn: '1h'
    });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
};
