import 'dotenv/config';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import passport from 'passport';
import { loginService, registerService } from '~/services/authService';
import { loginValidation, registerValidation } from '~/validations/authValidation';
import { generateToken } from '~/utils/generateJwt';

export const register = async (req: Request, res: Response) => {
    const userData = req.body;
    registerValidation.parse(userData);
    const user = await registerService(userData);
    res.json(user);
};

export const login = async (req: Request, res: Response) => {
    const userData = req.body;
    loginValidation.parse(userData);
    const { token, user } = await loginService(userData);
    res.status(StatusCodes.OK).json({ token, user });
};

export const me = async (req: Request, res: Response) => {
    const { _id, name, email } = req.user;
    res.json({ id: _id, name, email });
};

export const googleLogin = async (req: Request, res: Response) => {
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res);
};

export const googleCallback = (req: Request, res: Response) => {
    passport.authenticate('google', { session: false, failureRedirect: process.env.FRONTEND_URI }, (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.redirect(`${process.env.FRONTEND_URI}?error=Authentication failed`);
        }

        const token = generateToken(user._id);
        return res.redirect(
            `${process.env.FRONTEND_URI}passport?token=${token}&id=${user._id}&name=${user.name}&email=${user.email}&avatar=${user.avatar}`
        );
    })(req, res);
};

export const facebookLogin = (req: Request, res: Response) => {
    passport.authenticate('facebook', { scope: ['public_profile, email'] })(req, res);
};

export const facebookCallback = (req: Request, res: Response) => {
    passport.authenticate(
        'facebook',
        { session: false, failureRedirect: process.env.FRONTEND_URI },
        (err: any, user: any) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!user) {
                return res.redirect(`${process.env.FRONTEND_URI}?error=Authentication failed`);
            }

            const token = generateToken(user._id);
            return res.redirect(
                `${process.env.FRONTEND_URI}passport?token=${token}&id=${user._id}&name=${user.name}&email=${user.email}`
            );
        }
    )(req, res);
};
