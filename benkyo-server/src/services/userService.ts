import { z } from 'zod';
import { BadRequestsException } from '~/exceptions/badRequests';
import { ErrorCode } from '~/exceptions/root';

import { User } from '~/schemas';
import { updateUserValidation } from '~/validations/userValidation';

export const updateUserService = async (userId: string, userData: z.infer<typeof updateUserValidation>) => {
    const updateUser = await User.findByIdAndUpdate(userId, userData, { new: true });
    if (!updateUser) {
        throw new BadRequestsException('Something went wrong while updating user', ErrorCode.INTERNAL_SERVER_ERROR);
    }
    return {
        id: updateUser._id,
        username: updateUser.name,
        email: updateUser.email,
        avatar: updateUser.avatar
    };
};
