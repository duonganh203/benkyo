import { z } from 'zod';

import { User } from '~/schemas';
import { updateUserValidation } from '~/validations/userValidation';

export const updateUserService = async (userId: string, userData: z.infer<typeof updateUserValidation>) => {
    const data = userData;
    const user = await User.findByIdAndUpdate(userId, userData, { new: true });
    return user;
};
