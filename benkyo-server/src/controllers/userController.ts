import { Request, Response } from 'express';
import { updateUserService } from '~/services/userService';
import { updateUserValidation } from '~/validations/userValidation';

export const updateUserProfile = async (req: Request, res: Response) => {
    const userData = req.body;
    updateUserValidation.parse(userData);
    const updateUser = await updateUserService(req.user._id, userData);
    res.json(updateUser);
};
