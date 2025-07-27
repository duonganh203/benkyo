import { Request, Response } from 'express';
import { updateUserService, listUserAccountsService } from '~/services/userService';
import { updateUserValidation } from '~/validations/userValidation';

export const updateUserProfile = async (req: Request, res: Response) => {
    const userData = req.body;
    updateUserValidation.parse(userData);
    const updateUser = await updateUserService(req.user._id, userData);
    res.json(updateUser);
};
export const listUserAccounts = async (req: Request, res: Response) => {
    const users = await listUserAccountsService();
    res.json(users);
};
