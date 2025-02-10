import 'dotenv/config';
import { Request, Response } from 'express';
import { loginService, registerService } from '~/services/authService';
import { loginValidation, registerValidation, testValidation } from '~/validations/authValidation';
import { StatusCodes } from 'http-status-codes';
import { Person, Story } from '~/schemas/userSchema';

export const register = async (req: Request, res: Response) => {
    const userData = req.body;
    registerValidation.parse(userData);
    const user = await registerService(userData);
    res.json(user);
};

export const login = async (req: Request, res: Response) => {
    const userData = req.body;
    loginValidation.safeParse(userData);
    const { token, user } = await loginService(userData);
    res.status(StatusCodes.OK).json({ token, user });
};

export const me = async (req: Request, res: Response) => {
    const { _id, name, email } = req.user;
    res.json({ id: _id, name, email });
};

export const addStory = async (req: Request, res: Response) => {
    const pPerson = await Person.findOne({ name: 'Hello' });
    const pStory = await Story.findOne({ author: pPerson?._id }).populate('author');
    const a = testValidation.safeParse(pStory);
    res.json(a);
};

export const getStory = async (req: Request, res: Response) => {
    const story = await Story.findById(req.params.id).populate('author');
    res.json(story);
};
