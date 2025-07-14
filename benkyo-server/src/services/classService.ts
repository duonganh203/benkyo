import { Types } from 'mongoose';
import { NotFoundException } from '~/exceptions/notFound';
import { ErrorCode } from '~/exceptions/root';
import { Class, User, UserClassState } from '~/schemas';
import { ClassStateType } from '~/validations/classValidation';

export const createClassService = async (userId: string, data: ClassStateType) => {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundException('User not found', ErrorCode.NOT_FOUND);

    const newClass = new Class({
        ...data,
        owner: userId
    });

    const savedClass = await newClass.save();

    const userState = new UserClassState({
        user: new Types.ObjectId(userId),
        class: savedClass._id,
        points: 0,
        studyStreak: 0,
        lastStudyDate: null
    });
    await userState.save();

    await Class.findByIdAndUpdate(savedClass._id, {
        $push: { userClassStates: userState._id }
    });

    await Class.findByIdAndUpdate(savedClass._id, {
        $push: { userClassStates: userState._id }
    });

    return savedClass;
};
