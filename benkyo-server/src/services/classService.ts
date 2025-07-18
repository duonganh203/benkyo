import { Types } from 'mongoose';
import { ForbiddenRequestsException } from '~/exceptions/forbiddenRequests';
import { NotFoundException } from '~/exceptions/notFound';
import { ErrorCode } from '~/exceptions/root';
import { Class, Deck, User, UserClassState, UserDeckState } from '~/schemas';
import { ClassStateType } from '~/validations/classValidation';

export const createClassService = async (userId: string, data: ClassStateType) => {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundException('User not found', ErrorCode.NOT_FOUND);

    const newClass = new Class({ ...data, owner: userId });
    const savedClass = await newClass.save();

    const userState = new UserClassState({
        user: new Types.ObjectId(userId),
        class: savedClass._id,
        points: 0,
        studyStreak: 0,
        lastStudyDate: null
    });

    await userState.save();

    await Class.findByIdAndUpdate(savedClass._id, { $push: { userClassStates: userState._id } });
    await Class.findByIdAndUpdate(savedClass._id, { $push: { userClassStates: userState._id } });

    return {
        _id: savedClass._id.toString(),
        name: savedClass.name,
        description: savedClass.description,
        owner: savedClass.owner.toString(),
        bannerUrl: savedClass.bannerUrl,
        requiredApprovalToJoin: savedClass.requiredApprovalToJoin,
        message: 'Create class successfully'
    };
};

export const updateClassService = async (classId: string, userId: Types.ObjectId, data: Partial<ClassStateType>) => {
    const existingClass = await Class.findById(classId);
    if (!existingClass) throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);
    if (!existingClass.owner.equals(userId))
        throw new ForbiddenRequestsException('You do not have permission to update this class', ErrorCode.FORBIDDEN);

    existingClass.name = data.name ?? existingClass.name;
    existingClass.description = data.description ?? existingClass.description;
    existingClass.bannerUrl = data.bannerUrl ?? existingClass.bannerUrl;
    existingClass.visibility = data.visibility ?? existingClass.visibility;
    existingClass.requiredApprovalToJoin = data.requiredApprovalToJoin ?? existingClass.requiredApprovalToJoin;

    const updatedClass = await existingClass.save();

    return {
        _id: updatedClass._id.toString(),
        name: updatedClass.name,
        description: updatedClass.description,
        owner: updatedClass.owner.toString(),
        bannerUrl: updatedClass.bannerUrl,
        visibility: updatedClass.visibility,
        requiredApprovalToJoin: updatedClass.requiredApprovalToJoin,
        message: 'Update class successfully'
    };
};

export const deleteClassService = async (classId: string, userId: Types.ObjectId) => {
    const existingClass = await Class.findById(classId);
    if (!existingClass) throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);
    if (!existingClass.owner.equals(userId))
        throw new ForbiddenRequestsException('You do not have permission to delete this class', ErrorCode.FORBIDDEN);

    await UserClassState.deleteMany({ class: classId });
    await Deck.deleteMany({ _id: { $in: existingClass.desks } });
    await Class.findByIdAndDelete(classId);

    return { message: 'Delete class successfully' };
};

export const getClassUpdateByIdService = async (classId: string, userId: Types.ObjectId) => {
    const existingClass = await Class.findById(classId);
    if (!existingClass) throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);
    if (!existingClass.owner.equals(userId))
        throw new ForbiddenRequestsException('You do not have permission to view this class', ErrorCode.FORBIDDEN);

    return {
        name: existingClass.name,
        description: existingClass.description,
        visibility: existingClass.visibility,
        requiredApprovalToJoin: existingClass.requiredApprovalToJoin,
        bannerUrl: existingClass.bannerUrl
    };
};

export const getClassListUserService = async () => {
    const existingClasses = await Class.find().select('name description requiredApprovalToJoin bannerUrl');
    if (!existingClasses) throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);
    return existingClasses;
};

export const getMyClassListService = async (userId: Types.ObjectId, page: number, limit: number) => {
    const skip = (page - 1) * limit;

    const classes = await Class.find({ users: userId })
        .populate('desks')
        .select('_id name description requiredApprovalToJoin desks bannerUrl createdAt')
        .skip(skip)
        .limit(limit);

    const totalCount = await Class.countDocuments({ users: userId });

    const result = await Promise.all(
        classes.map(async (classItem) => {
            const totalDecks = classItem.desks.length;
            const studiedDeckCount = await UserDeckState.countDocuments({
                user: userId,
                deck: { $in: classItem.desks.map((deck: any) => deck._id) }
            });
            const progress = totalDecks > 0 ? Math.round((studiedDeckCount / totalDecks) * 100) : 0;

            return {
                _id: classItem._id,
                name: classItem.name,
                description: classItem.description,
                requiredApprovalToJoin: classItem.requiredApprovalToJoin,
                bannerUrl: classItem.bannerUrl,
                users: classItem.users,
                desks: classItem.desks,
                createdAt: classItem.createdAt,
                progress
            };
        })
    );

    return {
        data: result,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + result.length < totalCount
    };
};

export const getSuggestedListService = async (userId: Types.ObjectId, page: number, limit: number) => {
    const skip = (page - 1) * limit;

    const [suggestedClasses, totalCount] = await Promise.all([
        Class.find({ users: { $ne: userId }, visibility: 'public' })
            .select('_id name description requiredApprovalToJoin bannerUrl createdAt owner')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),

        Class.countDocuments({ users: { $ne: userId } })
    ]);

    const data = suggestedClasses.map((classItem) => ({
        _id: classItem._id.toString(),
        name: classItem.name,
        description: classItem.description,
        requiredApprovalToJoin: classItem.requiredApprovalToJoin,
        bannerUrl: classItem.bannerUrl,
        createdAt: classItem.createdAt,
        owner: classItem.owner.toString()
    }));

    return {
        data,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + data.length < totalCount
    };
};

export const requestJoinClassService = async (classId: string, userId: Types.ObjectId) => {
    const existingClass = await Class.findById(classId);
    if (!existingClass) throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);

    const alreadyMember = existingClass.users.some((user) => user.equals(userId));
    if (alreadyMember) return { message: 'Already a member of this class' };

    if (!existingClass.requiredApprovalToJoin) {
        existingClass.users.push(new Types.ObjectId(userId));
        await existingClass.save();
        return { message: 'Joined class successfully' };
    }

    const alreadyRequested = existingClass.joinRequests.some((req) => req.user.equals(userId));
    if (alreadyRequested) return { message: 'You have already requested to join this class' };

    const joinRequest = {
        user: new Types.ObjectId(userId),
        requestDate: new Date()
    };

    existingClass.joinRequests.push(joinRequest);
    await existingClass.save();

    return { message: 'Join request sent successfully' };
};
