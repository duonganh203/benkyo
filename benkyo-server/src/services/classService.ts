import { Types } from 'mongoose';
import { ForbiddenRequestsException } from '~/exceptions/forbiddenRequests';
import { NotFoundException } from '~/exceptions/notFound';
import { ErrorCode } from '~/exceptions/root';
import { Class, Deck, User, UserClassState, UserDeckState } from '~/schemas';
import { sendToUser } from '~/utils/socketServer';
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

    const classes = await Class.find({
        $or: [{ users: userId }, { owner: userId }]
    })
        .populate('desks')
        .select('_id name description requiredApprovalToJoin desks bannerUrl createdAt')
        .skip(skip)
        .limit(limit);

    const totalCount = await Class.countDocuments({ users: userId });

    const result = await Promise.all(
        classes.map(async (classItem) => {
            const totalDecks = classItem.desks.length;
            const studiedDeckCount = await UserDeckState.countDocuments({
                user: userId
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
        Class.find({
            users: { $ne: userId },
            owner: { $ne: userId },
            visibility: 'public'
        })
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

export const requestJoinClasssService = async (classId: string, userId: Types.ObjectId) => {
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

export const getClassManagementByIdService = async (classId: string, userId: Types.ObjectId) => {
    const existingClass = await Class.findById(classId)
        .populate({
            path: 'users',
            select: '_id name email avatar'
        })
        .populate({
            path: 'owner',
            select: '_id name email avatar'
        })
        .populate({
            path: 'joinRequests.user',
            select: '_id name email avatar'
        })
        .populate({
            path: 'userClassStates',
            populate: {
                path: 'user',
                select: '_id name email avatar'
            }
        })
        .populate({
            path: 'visited.history.userId',
            select: '_id name email avatar'
        })

        .populate({
            path: 'desks'
        })
        .lean();

    if (!existingClass) throw new Error('Class not found');

    if (!existingClass.owner._id.equals(userId))
        throw new ForbiddenRequestsException('You do not have permission to view this class', ErrorCode.FORBIDDEN);

    return existingClass;
};

export const acceptJoinRequestService = async (classId: string, requestUserId: string, ownerId: string) => {
    const existingClass = await Class.findById(classId);
    if (!existingClass) throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);

    if (!existingClass.owner.equals(ownerId)) throw new ForbiddenRequestsException('Unauthorized', ErrorCode.FORBIDDEN);

    const joinRequestIndex = existingClass.joinRequests.findIndex((req) => req.user.equals(requestUserId));

    if (joinRequestIndex === -1) throw new NotFoundException('Join request not found', ErrorCode.NOT_FOUND);

    existingClass.joinRequests.splice(joinRequestIndex, 1);

    existingClass.users.push(new Types.ObjectId(requestUserId));

    await existingClass.save();

    return { message: 'Join request accepted' };
};

export const rejectJoinRequestService = async (classId: string, requestUserId: string, ownerId: string) => {
    const existingClass = await Class.findById(classId);
    if (!existingClass) throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);

    if (!existingClass.owner.equals(ownerId)) throw new ForbiddenRequestsException('Unauthorized', ErrorCode.FORBIDDEN);

    const joinRequestIndex = existingClass.joinRequests.findIndex((req) => req.user.equals(requestUserId));

    if (joinRequestIndex === -1) throw new NotFoundException('Join request not found', ErrorCode.NOT_FOUND);

    existingClass.joinRequests.splice(joinRequestIndex, 1);

    await existingClass.save();

    return { message: 'Join request rejected' };
};

export const inviteMemberToClassService = async (classId: string, ownerId: Types.ObjectId, targetUserEmail: string) => {
    const existingClass = await Class.findById(classId);
    if (!existingClass) throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);

    if (!existingClass.owner.equals(ownerId)) {
        throw new ForbiddenRequestsException('You are not authorized', ErrorCode.FORBIDDEN);
    }

    const targetUser = await User.findOne({ email: targetUserEmail });
    if (!targetUser) throw new NotFoundException('User not found', ErrorCode.NOT_FOUND);

    const alreadyInvited = existingClass.invitedUsers.some((entry) => entry.user.equals(targetUser._id));
    if (alreadyInvited) return { message: 'User already invited' };

    const alreadyJoined = existingClass.users.some((entry) => entry.equals(targetUser._id));
    if (alreadyJoined) return { message: 'User is already a member' };

    existingClass.invitedUsers.push({
        user: targetUser._id,
        invitedAt: new Date()
    });

    await existingClass.save();

    sendToUser(targetUser.email, {
        type: 'invite',
        payload: {
            classId: existingClass._id.toString(),
            className: existingClass.name,
            description: existingClass.description
        }
    });

    return { message: 'User invited successfully' };
};

export const acceptInviteClassService = async (classId: string, userId: string) => {
    const existingClass = await Class.findById(classId);
    if (!existingClass) throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);

    const isInvited = existingClass.invitedUsers.some((entry) => entry.user.equals(userId));
    if (!isInvited) throw new ForbiddenRequestsException('You are not invited to this class', ErrorCode.FORBIDDEN);

    const alreadyMember = existingClass.users.some((entry) => entry.equals(userId));
    if (alreadyMember) return { message: 'You are already a member of this class' };

    existingClass.invitedUsers.pull({ user: new Types.ObjectId(userId) });

    existingClass.users.push(new Types.ObjectId(userId));

    await existingClass.save();

    return { message: 'Accepted class invitation successfully' };
};

export const rejectInviteClassService = async (classId: string, userId: string) => {
    const existingClass = await Class.findById(classId);
    if (!existingClass) throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);

    const wasInvited = existingClass.invitedUsers.some((entry) => entry.user.equals(userId));
    if (!wasInvited) return { message: 'You were not invited to this class' };

    existingClass.invitedUsers.pull({ user: new Types.ObjectId(userId) });

    await existingClass.save();

    return { message: 'Rejected class invitation successfully' };
};

export const getInviteClassService = async (userId: Types.ObjectId) => {
    const invitedClasses = await Class.find({
        invitedUsers: { $elemMatch: { user: userId } }
    })
        .select('_id name description invitedUsers')
        .lean();

    if (!invitedClasses) return [];

    const notifications = invitedClasses.map((cls) => {
        const latestInvite = [...cls.invitedUsers]
            .filter((u) => u.user.toString() === userId.toString())
            .sort((a, b) => new Date(b.invitedAt).getTime() - new Date(a.invitedAt).getTime())[0];

        return {
            id: cls._id.toString(),
            classId: cls._id.toString(),
            className: cls.name,
            description: cls.description,
            type: 'invite',
            createdAt: latestInvite?.invitedAt,
            message: `You were invited to class: ${cls.name}`
        };
    });

    return notifications;
};

export const removeUserFromClassService = async (classId: string, userId: string, ownerId: Types.ObjectId) => {
    const existingClass = await Class.findById(classId);
    if (!existingClass) throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);

    if (!existingClass.owner.equals(ownerId))
        throw new ForbiddenRequestsException(
            'You do not have permission to remove users from this class',
            ErrorCode.FORBIDDEN
        );

    if (!existingClass.users.some((user) => user.equals(userId)))
        throw new NotFoundException('User not found in this class', ErrorCode.NOT_FOUND);

    existingClass.users = existingClass.users.filter((user) => !user.equals(userId));
    await existingClass.save();

    await UserClassState.deleteOne({ class: classId, user: userId });

    return { message: 'User removed from class successfully' };
};
