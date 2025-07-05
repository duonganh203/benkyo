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
export const listUserAccountsService = async () => {
    const users = await User.find();
    return users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isPro: user.isPro,
        proExpiryDate: user.proExpiryDate,
        createdAt: user.createdAt,
        role: user.role
    }));
};
