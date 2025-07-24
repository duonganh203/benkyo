import { Types } from 'mongoose';
import { ForbiddenRequestsException } from '~/exceptions/forbiddenRequests';
import { NotFoundException } from '~/exceptions/notFound';
import { ErrorCode } from '~/exceptions/root';
import { Class, Deck, PublicStatus, User, UserClassState, UserDeckState } from '~/schemas';
import { sendToUser } from '~/utils/socketServer';
import { ClassStateType } from '~/validations/classValidation';
import {
    VisitHistoryEntry,
    ClassDeckRef,
    PopulatedUser,
    ClassProgressData,
    ClassDeckProgress,
    GetClassUserByIdResponse,
    MongooseDeckRef,
    MongooseUserRef,
    MongooseVisitEntry,
    MongooseUserClassState,
    MongooseClass,
    MongooseOwnerRef
} from '~/types/classTypes';

export const createClassService = async (userId: string, data: ClassStateType) => {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundException('User not found', ErrorCode.NOT_FOUND);

    const newClass = new Class({ ...data, owner: userId });
    const savedClass = await newClass.save();

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
        .populate('decks.deck')
        .select('_id name description requiredApprovalToJoin decks bannerUrl createdAt')
        .skip(skip)
        .limit(limit);

    const totalCount = await Class.countDocuments({ users: userId });

    const result = await Promise.all(
        classes.map(async (classItem) => {
            const classDeckIds = classItem.decks.map((d) => d.deck?._id?.toString()).filter(Boolean);
            const scheduledDeckIds = classItem.decks
                .filter((d) => d.startTime && d.endTime)
                .map((d) => d.deck?._id?.toString())
                .filter(Boolean);

            const userStates = await UserClassState.find({
                user: userId,
                class: classItem._id,
                deck: { $in: scheduledDeckIds }
            });

            let totalCompleted = 0;
            let totalCards = 0;

            for (const state of userStates) {
                totalCompleted += state.completedCardIds?.length || 0;
                totalCards += state.totalCount || 0;
            }

            const progress = totalCards > 0 ? Math.round((totalCompleted / totalCards) * 100) : 0;

            return {
                _id: classItem._id,
                name: classItem.name,
                description: classItem.description,
                requiredApprovalToJoin: classItem.requiredApprovalToJoin,
                bannerUrl: classItem.bannerUrl,
                decks: classItem.decks,
                createdAt: classItem.createdAt,
                progress
            };
        })
    );

    return {
        data: result,
        total: totalCount
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
            path: 'decks',
            populate: {
                path: 'deck',
                select: '_id name'
            }
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

export const removeDeckFromClassService = async (classId: string, deckId: string, ownerId: Types.ObjectId) => {
    const existingClass = await Class.findById(classId);
    if (!existingClass) {
        throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);
    }

    if (!existingClass.owner.equals(ownerId)) {
        throw new ForbiddenRequestsException(
            'You do not have permission to remove decks from this class',
            ErrorCode.FORBIDDEN
        );
    }

    const deckExists = existingClass.decks.some((deckEntry) => deckEntry.deck.equals(deckId));

    if (!deckExists) {
        throw new NotFoundException('Deck not found in this class', ErrorCode.NOT_FOUND);
    }

    existingClass.decks.pull({ deck: new Types.ObjectId(deckId) });

    await existingClass.save();

    await UserClassState.deleteMany({ class: classId, deck: deckId });

    return { message: 'Deck removed from class successfully' };
};

export const addDeckToClassService = async ({
    classId,
    deckId,
    description,
    startTime,
    endTime,
    ownerId
}: {
    classId: string;
    deckId: string;
    description?: string;
    startTime?: Date;
    endTime?: Date;
    ownerId: string;
}) => {
    const existingClass = await Class.findById(classId);
    if (!existingClass) throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);

    if (!existingClass.owner.equals(ownerId))
        throw new ForbiddenRequestsException('Only class owner can add decks', ErrorCode.FORBIDDEN);

    const deck = await Deck.findById(deckId);
    if (!deck) throw new NotFoundException('Deck not found', ErrorCode.NOT_FOUND);

    const isApproved = deck.publicStatus === 2;
    const isOwnedByClassOwner = deck.owner.equals(ownerId);

    if (!isApproved && !isOwnedByClassOwner)
        throw new ForbiddenRequestsException('You can only add approved or owned decks', ErrorCode.FORBIDDEN);

    const alreadyAdded = existingClass.decks.some((d) => d.deck.equals(deckId));
    if (alreadyAdded) throw new ForbiddenRequestsException('Deck already exists in this class', ErrorCode.FORBIDDEN);

    if (startTime && endTime && startTime > endTime)
        throw new ForbiddenRequestsException('Start time must be before end time', ErrorCode.FORBIDDEN);

    existingClass.decks.push({
        deck: new Types.ObjectId(deckId),
        description,
        startTime,
        endTime
    });

    await existingClass.save();
    return { message: 'Deck added successfully' };
};

export const getDecksToAddToClassService = async (classId: string) => {
    const classDoc = await Class.findById(classId);
    if (!classDoc) throw new Error('Class not found');

    const ownerId = classDoc.owner.toString();
    const existingDeckIds = classDoc.decks.map((d) => d.deck.toString());

    const decks = await Deck.find({
        _id: { $nin: existingDeckIds },
        $or: [{ owner: ownerId }, { publicStatus: PublicStatus.APPROVED }]
    })
        .select('_id name description')
        .sort({ createdAt: -1 });

    return decks;
};

export const getClassUserByIdService = async (classId: string, userId: string): Promise<GetClassUserByIdResponse> => {
    const existingClass = await Class.findById(classId)
        .select(
            'name description owner users decks bannerUrl requiredApprovalToJoin userClassStates createdAt status visibility visited'
        )
        .populate('owner', '_id name')
        .populate('users', 'name email')
        .populate({
            path: 'decks.deck',
            select: 'name cardCount avgRating'
        })
        .populate({
            path: 'userClassStates',
            populate: {
                path: 'user',
                select: '_id name email avatar'
            }
        });

    if (!existingClass) throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);

    const todayStr = new Date().toISOString().split('T')[0];
    const visitHistory = existingClass.visited?.history;

    if (visitHistory) {
        const alreadyVisited = visitHistory.some(
            (visit: VisitHistoryEntry) =>
                visit.userId.toString() === userId && new Date(visit.lastVisit).toISOString().split('T')[0] === todayStr
        );

        if (!alreadyVisited) {
            visitHistory.push({
                userId: new Types.ObjectId(userId),
                lastVisit: new Date()
            });
            await existingClass.save();
        }
    }

    const deckRefs = existingClass.decks || [];
    const deckIds = deckRefs.map((d: any) => d.deck?._id).filter(Boolean);

    const bestSessions = await UserClassState.aggregate([
        {
            $match: {
                user: new Types.ObjectId(userId),
                class: new Types.ObjectId(classId),
                deck: { $in: deckIds },
                endTime: { $exists: true }
            }
        },
        {
            $sort: { correctCount: -1, endTime: -1 }
        },
        {
            $group: {
                _id: '$deck',
                bestSession: { $first: '$$ROOT' }
            }
        }
    ]);

    const progressMap = new Map<string, { correctCount: number; totalCount: number }>();

    for (const result of bestSessions) {
        const deckId = result._id.toString();
        const session = result.bestSession;
        progressMap.set(deckId, {
            correctCount: session.correctCount || 0,
            totalCount: session.totalCount || 0
        });
    }

    const decks = deckRefs.map((d: any) => {
        const deckData = d.deck;
        const progress = progressMap.get(deckData?._id.toString()) || {
            correctCount: 0,
            totalCount: 0
        };

        const actualTotalCount = progress.totalCount > 0 ? progress.totalCount : deckData?.cardCount || 0;

        return {
            _id: deckData?._id.toString() || '',
            name: deckData?.name || '',
            cardCount: deckData?.cardCount || 0,
            avgRating: deckData?.avgRating || 0,
            description: d.description || '',
            startTime: d.startTime,
            endTime: d.endTime,
            correctCount: progress.correctCount,
            totalCount: actualTotalCount
        };
    });

    const scheduledDecks = decks.filter((deck: any) => deck.startTime && deck.endTime);
    let completionRate = 0;

    if (scheduledDecks.length > 0) {
        const totalProgress = scheduledDecks.reduce((sum: any, deck: any) => {
            const deckProgress = deck.totalCount > 0 ? (deck.correctCount / deck.totalCount) * 100 : 0;
            return sum + deckProgress;
        }, 0);
        completionRate = Math.round(totalProgress / scheduledDecks.length);
    }

    const sortedTopUserStates = (existingClass.userClassStates as any[])
        .filter((ucs: any) => ucs.user._id.toString() !== existingClass.owner._id.toString())
        .sort((a: any, b: any) => b.points - a.points)
        .slice(0, 5);

    return {
        _id: existingClass._id.toString(),
        name: existingClass.name,
        description: existingClass.description,
        users: existingClass.users.map((u: any) => ({
            _id: u._id.toString(),
            name: u.name,
            email: u.email
        })),
        decks,
        owner: {
            _id: existingClass.owner._id ? existingClass.owner._id.toString() : existingClass.owner.toString(),
            name: (existingClass.owner as any).name || ''
        },
        visibility: existingClass.visibility,
        requiredApprovalToJoin: existingClass.requiredApprovalToJoin,
        createdAt: existingClass.createdAt,
        userClassStates: sortedTopUserStates,
        completionRate,
        visited: {
            history: (existingClass.visited?.history || []).map((h: any) => h.userId?.toString() || '')
        },
        bannerUrl: existingClass.bannerUrl
    };
};
