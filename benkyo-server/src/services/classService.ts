import { Types } from 'mongoose';
import { ForbiddenRequestsException } from '~/exceptions/forbiddenRequests';
import { NotFoundException } from '~/exceptions/notFound';
import { ErrorCode } from '~/exceptions/root';
import { Class, Deck, PublicStatus, User, UserClassState, UserDeckState, Card, Quiz } from '~/schemas';
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
    MongooseOwnerRef,
    PopulatedDeck,
    ClassVisited
} from '~/types/classTypes';
import { BadRequestsException } from '~/exceptions/badRequests';
import { InternalException } from '~/exceptions/internalException';
import { toISODate } from '~/utils/handleDate';

interface NormalizedNotification {
    notificationType: 'invite' | 'overdue' | 'upcoming';
    sortTime: Date;
    priority: number;
}

interface NormalizedInviteNotification extends NormalizedNotification {
    id: string;
    classId: string;
    className: string;
    description: string;
    type: string;
    createdAt: Date;
    message: string;
    notificationType: 'invite';
}

interface NormalizedScheduleNotification extends NormalizedNotification {
    classId: string;
    className: string;
    deckId: string;
    deckName: string;
    description: string;
    endTime: Date;
    progress: number;
    totalCards: number;
    completedCards: number;
    notificationType: 'overdue' | 'upcoming';
}

interface NormalizedOverdueNotification extends NormalizedScheduleNotification {
    hoursOverdue: number;
    isOverdue: boolean;
    notificationType: 'overdue';
}

interface NormalizedUpcomingNotification extends NormalizedScheduleNotification {
    hoursUntilDeadline: number;
    isOverdue: boolean;
    notificationType: 'upcoming';
}

type UnifiedNotification =
    | NormalizedInviteNotification
    | NormalizedOverdueNotification
    | NormalizedUpcomingNotification;

export const classCreateService = async (userId: string, data: ClassStateType) => {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundException('User not found', ErrorCode.NOT_FOUND);

    const newClass = new Class({ ...data, owner: userId });
    const savedClass = await newClass.save();

    return {
        _id: savedClass._id.toString(),
        name: savedClass.name,
        description: savedClass.description,
        visibility: savedClass.visibility,
        bannerUrl: savedClass.bannerUrl,
        requiredApprovalToJoin: savedClass.requiredApprovalToJoin,
        owner: savedClass.owner.toString()
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

export const classDeleteService = async (classId: string, userId: Types.ObjectId) => {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundException('User not found', ErrorCode.NOT_FOUND);

    const existingClass = await Class.findById(classId);
    if (!existingClass) throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);

    if (!existingClass.owner.equals(userId))
        throw new ForbiddenRequestsException('You do not have permission to delete this class', ErrorCode.FORBIDDEN);

    await UserClassState.deleteMany({ class: classId });
    await Quiz.deleteMany({ class: classId });
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

export const getMyClassListService = async (userId: Types.ObjectId, page: number, limit: number, search?: string) => {
    const skip = (page - 1) * limit;
    const searchQuery = search ? { name: { $regex: search, $options: 'i' } } : {};
    const totalCount = await Class.countDocuments({
        $or: [{ users: userId }, { owner: userId }],
        ...searchQuery
    });

    const classes = await Class.find({
        $or: [{ users: userId }, { owner: userId }],
        ...searchQuery
    })
        .populate('decks.deck')
        .select('_id name description requiredApprovalToJoin bannerUrl createdAt decks')
        .skip(skip)
        .limit(limit);

    const result = await Promise.all(
        classes.map(async (classItem) => {
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
                createdAt: classItem.createdAt,
                progress
            };
        })
    );

    return {
        data: result,
        hasMore: skip + result.length < totalCount
    };
};

export const getSuggestedListService = async (userId: Types.ObjectId, page: number, limit: number, search?: string) => {
    const skip = (page - 1) * limit;
    const searchQuery = search ? { name: { $regex: search, $options: 'i' } } : {};

    const baseQuery = {
        users: { $ne: userId },
        owner: { $ne: userId },
        visibility: 'public',
        ...searchQuery
    };

    const [suggestedClasses, totalCount] = await Promise.all([
        Class.find(baseQuery)
            .select('_id name description requiredApprovalToJoin bannerUrl createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),

        Class.countDocuments(baseQuery)
    ]);

    const data = suggestedClasses.map((classItem) => ({
        _id: classItem._id.toString(),
        name: classItem.name,
        description: classItem.description,
        requiredApprovalToJoin: classItem.requiredApprovalToJoin,
        bannerUrl: classItem.bannerUrl,
        createdAt: classItem.createdAt
    }));

    return {
        data,
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

const updateClassVisitedHistory = async (classId: string, userId: Types.ObjectId) => {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundException('User not found', ErrorCode.NOT_FOUND);

    const existingClass = await Class.findById(classId);
    if (!existingClass) throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);

    const todayStr = toISODate(Date.now());

    const alreadyVisitedToday = existingClass.visited.some((visit: ClassVisited) => {
        const visitDate = toISODate(visit.lastVisit);
        return visit.userId.equals(userId) && visitDate === todayStr;
    });

    if (!alreadyVisitedToday) {
        await Class.updateOne({ _id: classId }, { $push: { visited: { userId, lastVisit: new Date() } } });
    }
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
            path: 'visited.userId',
            select: '_id name email avatar'
        })
        .populate({
            path: 'invitedUsers.user',
            select: '_id name email avatar'
        })
        .populate({
            path: 'decks.deck',
            select: '_id name description cardCount'
        })
        .lean();

    if (!existingClass) throw new Error('Class not found');

    if (!existingClass.owner._id.equals(userId))
        throw new ForbiddenRequestsException('You do not have permission to view this class', ErrorCode.FORBIDDEN);

    const currentDate = new Date();
    let overdueMembersCount = 0;

    if (existingClass.decks && existingClass.users) {
        for (const member of existingClass.users) {
            let hasOverdue = false;

            for (const deckItem of existingClass.decks) {
                if (deckItem.endTime && new Date(deckItem.endTime) < currentDate) {
                    const deckData = deckItem.deck;
                    if (typeof deckData === 'object' && deckData !== null && 'cardCount' in deckData) {
                        const populatedDeck = deckData as PopulatedDeck;
                        const userState = await UserClassState.findOne({
                            user: member._id,
                            class: classId,
                            deck: populatedDeck._id
                        });

                        const totalCards = populatedDeck.cardCount;
                        const completedCards = userState?.completedCardIds?.length || 0;
                        const progress = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

                        if (progress < 100) {
                            hasOverdue = true;
                            break;
                        }
                    }
                }
            }

            if (hasOverdue) {
                overdueMembersCount++;
            }
        }
    }

    const formattedClass = {
        ...existingClass,
        decks:
            existingClass.decks?.map((deckItem: any) => ({
                deck: deckItem.deck,
                description: deckItem.description,
                startTime: deckItem.startTime,
                endTime: deckItem.endTime
            })) || [],
        visited: {
            ...existingClass.visited,
            history: (existingClass.visited || [])
                .sort((a: any, b: any) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime())
                .filter(
                    (visit: any, index: number, arr: any[]) =>
                        arr.findIndex((v: any) => v.userId.toString() === visit.userId.toString()) === index
                )
                .map((visit: any) => ({
                    userId: visit.userId,
                    lastVisit: visit.lastVisit
                }))
        },
        overdueMembersCount
    };

    return formattedClass;
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

    await updateClassVisitedHistory(classId, new Types.ObjectId(userId));

    const deckRefs = existingClass.decks || [];
    const deckIds = deckRefs.map((d: any) => d.deck?._id).filter(Boolean);

    const allSessions = await UserClassState.find({
        user: userId,
        class: classId,
        deck: { $in: deckIds },
        endTime: { $exists: true }
    })
        .sort({ correctCount: -1, endTime: -1 })
        .lean();

    const progressMap = new Map<string, { correctCount: number; totalCount: number }>();
    for (const session of allSessions) {
        const deckId = session.deck.toString();
        if (!progressMap.has(deckId)) {
            progressMap.set(deckId, {
                correctCount: session.correctCount || 0,
                totalCount: session.totalCount || 0
            });
        }
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
            history: (existingClass.visited || []).map((h: any) => h.userId?.toString() || '')
        },
        bannerUrl: existingClass.bannerUrl
    };
};

export const getOverdueSchedulesService = async (userId: Types.ObjectId) => {
    const currentDate = new Date();
    const oneDayAgo = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);

    const userClasses = await Class.find({
        users: userId,
        owner: { $ne: userId }
    })
        .populate({
            path: 'decks.deck',
            select: 'name cardCount'
        })
        .select('_id name decks')
        .lean();

    interface OverdueSchedule {
        classId: string;
        className: string;
        deckId: string;
        deckName: string;
        description: string;
        endTime: Date;
        progress: number;
        totalCards: number;
        completedCards: number;
        hoursOverdue: number;
        isOverdue: boolean;
    }

    const overdueSchedules: OverdueSchedule[] = [];

    for (const classItem of userClasses) {
        if (!classItem.decks) continue;

        const scheduledDecks = classItem.decks.filter(
            (d: any) =>
                d.startTime && d.endTime && new Date(d.endTime) < currentDate && new Date(d.endTime) >= oneDayAgo
        );

        for (const deckRef of scheduledDecks) {
            const deck = deckRef.deck as any;
            if (!deck || !deckRef.endTime) continue;

            const userState = await UserClassState.findOne({
                user: userId,
                class: classItem._id,
                deck: deck._id
            });

            const totalCards = deck.cardCount || 0;
            const completedCards = userState?.completedCardIds?.length || 0;
            const progress = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

            if (progress < 100) {
                const hoursOverdue = Math.floor(
                    (currentDate.getTime() - new Date(deckRef.endTime).getTime()) / (1000 * 60 * 60)
                );

                overdueSchedules.push({
                    classId: classItem._id.toString(),
                    className: classItem.name,
                    deckId: deck._id.toString(),
                    deckName: deck.name,
                    description: deckRef.description || '',
                    endTime: deckRef.endTime,
                    progress,
                    totalCards,
                    completedCards,
                    hoursOverdue,
                    isOverdue: true
                });
            }
        }
    }

    return overdueSchedules;
};

export const getUpcomingDeadlinesService = async (userId: Types.ObjectId) => {
    const currentDate = new Date();
    const nextWeek = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const userClasses = await Class.find({
        users: userId,
        owner: { $ne: userId }
    })
        .populate({
            path: 'decks.deck',
            select: 'name cardCount'
        })
        .select('_id name decks')
        .lean();

    interface UpcomingDeadline {
        classId: string;
        className: string;
        deckId: string;
        deckName: string;
        description: string;
        endTime: Date;
        progress: number;
        totalCards: number;
        completedCards: number;
        hoursUntilDeadline: number;
        isOverdue: boolean;
    }

    const upcomingDeadlines: UpcomingDeadline[] = [];

    for (const classItem of userClasses) {
        if (!classItem.decks) continue;

        const scheduledDecks = classItem.decks.filter(
            (d: any) => d.startTime && d.endTime && new Date(d.endTime) > currentDate && new Date(d.endTime) <= nextWeek
        );

        for (const deckRef of scheduledDecks) {
            const deck = deckRef.deck as any;
            if (!deck?._id || !deckRef.endTime) continue;

            const userState = await UserClassState.findOne({
                user: userId,
                class: classItem._id,
                deck: deck._id
            });

            const totalCards = deck.cardCount || 0;
            const completedCards = userState?.completedCardIds?.length || 0;
            const progress = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

            const endTime = new Date(deckRef.endTime);
            const hoursUntilDeadline = Math.floor((endTime.getTime() - currentDate.getTime()) / (1000 * 60 * 60));

            upcomingDeadlines.push({
                classId: classItem._id.toString(),
                className: classItem.name,
                deckId: deck._id.toString(),
                deckName: deck.name || 'Unknown Deck',
                description: deckRef.description || '',
                endTime: deckRef.endTime,
                progress,
                totalCards,
                completedCards,
                hoursUntilDeadline,
                isOverdue: false
            });
        }
    }

    return upcomingDeadlines.sort((a, b) => a.hoursUntilDeadline - b.hoursUntilDeadline);
};

export const getAllNotificationsService = async (userId: Types.ObjectId) => {
    const [inviteNotifications, overdueSchedules, upcomingDeadlines] = await Promise.all([
        getInviteClassService(userId),
        getOverdueSchedulesService(userId),
        getUpcomingDeadlinesService(userId)
    ]);

    const normalizedInvites: NormalizedInviteNotification[] = inviteNotifications.map((invite) => ({
        ...invite,
        notificationType: 'invite' as const,
        sortTime: new Date(invite.createdAt || new Date()),
        priority: 2
    }));

    const normalizedOverdue: NormalizedOverdueNotification[] = overdueSchedules.map((schedule) => ({
        ...schedule,
        notificationType: 'overdue' as const,
        sortTime: new Date(schedule.endTime),
        priority: 1
    }));

    const normalizedUpcoming: NormalizedUpcomingNotification[] = upcomingDeadlines.map((deadline) => ({
        ...deadline,
        notificationType: 'upcoming' as const,
        sortTime: new Date(deadline.endTime),
        priority: deadline.hoursUntilDeadline <= 24 ? 3 : 4
    }));

    const allNotifications = [...normalizedInvites, ...normalizedOverdue, ...normalizedUpcoming].sort((a, b) => {
        if (a.notificationType === 'invite' && b.notificationType === 'invite') {
            return new Date(b.sortTime).getTime() - new Date(a.sortTime).getTime();
        }
        return a.priority - b.priority;
    });

    return {
        all: allNotifications,
        invites: inviteNotifications,
        schedules: {
            overdue: overdueSchedules,
            upcoming: upcomingDeadlines,
            criticalUpcoming: upcomingDeadlines.filter((d) => d.hoursUntilDeadline <= 24)
        },
        summary: {
            totalInvites: inviteNotifications.length,
            totalOverdue: overdueSchedules.length,
            totalUpcoming: upcomingDeadlines.length,
            totalCritical: upcomingDeadlines.filter((d) => d.hoursUntilDeadline <= 24).length,
            totalAll: allNotifications.length
        }
    };
};

export const cancelInviteService = async (classId: string, userId: string, ownerId: Types.ObjectId) => {
    const existingClass = await Class.findById(classId);
    if (!existingClass) throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);

    if (!existingClass.owner.equals(ownerId)) {
        throw new ForbiddenRequestsException('Only class owner can cancel invites', ErrorCode.FORBIDDEN);
    }

    const wasInvited = existingClass.invitedUsers.some((entry) => entry.user.equals(userId));
    if (!wasInvited) {
        return { message: 'User was not invited to this class' };
    }

    existingClass.invitedUsers.pull({ user: new Types.ObjectId(userId) });
    await existingClass.save();

    return { message: 'Invite cancelled successfully' };
};

interface MemberProgress {
    userId: string;
    userName: string;
    userEmail: string;
    userAvatar: string;
    overallProgress: number;
    overdueCount: number;
    upcomingCount: number;
    deckProgresses: Array<{
        deckId: string;
        deckName: string;
        description: string;
        startTime?: Date;
        endTime?: Date;
        progress: number;
        totalCards: number;
        completedCards: number;
        isOverdue: boolean;
        hoursOverdue?: number;
        hoursUntilDeadline?: number;
    }>;
}

export const getClassMemberProgressService = async (classId: string, requesterId: Types.ObjectId) => {
    const existingClass = await Class.findById(classId)
        .populate({
            path: 'users',
            select: '_id name email avatar'
        })
        .populate({
            path: 'decks.deck',
            select: '_id name description cardCount'
        })
        .lean();

    if (!existingClass) throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);

    const memberProgresses: MemberProgress[] = [];

    for (const member of existingClass.users as any[]) {
        const userClassStates = await UserClassState.find({
            user: member._id,
            class: classId
        }).populate('deck', '_id name description cardCount');

        const deckProgresses = existingClass.decks.map((classDeck: any) => {
            const userClassState = userClassStates.find((ucs: any) => ucs.deck._id.equals(classDeck.deck._id));
            const totalCards = classDeck.deck.cardCount || 0;
            const completedCards = userClassState?.completedCardIds?.length || 0;
            const progress = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;
            const endTime = classDeck.endTime;
            const isOverdue = endTime ? new Date() > endTime : false;
            const hoursOverdue =
                endTime && isOverdue ? Math.floor((new Date().getTime() - endTime.getTime()) / (1000 * 60 * 60)) : 0;
            const hoursUntilDeadline =
                endTime && !isOverdue ? Math.floor((endTime.getTime() - new Date().getTime()) / (1000 * 60 * 60)) : 0;

            return {
                deckId: classDeck.deck._id.toString(),
                deckName: classDeck.deck.name,
                description: classDeck.description || '',
                startTime: classDeck.startTime ? new Date(classDeck.startTime) : undefined,
                endTime: classDeck.endTime ? new Date(classDeck.endTime) : undefined,
                progress,
                totalCards,
                completedCards,
                isOverdue,
                hoursOverdue: isOverdue ? hoursOverdue : undefined,
                hoursUntilDeadline: !isOverdue ? hoursUntilDeadline : undefined
            };
        });

        const overdueCount = deckProgresses.filter((dp) => dp.isOverdue).length;
        const upcomingCount = deckProgresses.filter(
            (dp) => !dp.isOverdue && dp.hoursUntilDeadline !== undefined && dp.hoursUntilDeadline <= 24
        ).length;
        const overallProgress =
            deckProgresses.length > 0
                ? deckProgresses.reduce((sum, dp) => sum + dp.progress, 0) / deckProgresses.length
                : 0;

        memberProgresses.push({
            userId: member._id.toString(),
            userName: member.name,
            userEmail: member.email,
            userAvatar: member.avatar,
            overallProgress: Math.round(overallProgress),
            overdueCount,
            upcomingCount,
            deckProgresses
        });
    }

    return memberProgresses;
};

export const startClassDeckSessionService = async (
    userId: string,
    classId: string,
    deckId: string,
    forceNew: boolean
) => {
    if (!userId || !classId || !deckId) {
        throw new BadRequestsException('Missing required parameters', ErrorCode.UNPROCESSALE_ENTITY);
    }

    const deck = await Deck.findById(deckId);
    if (!deck) {
        throw new NotFoundException('Deck not found', ErrorCode.NOT_FOUND);
    }

    const classDoc = await Class.findById(classId);
    if (!classDoc) {
        throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);
    }

    const isMember = classDoc.users.some((user) => user.equals(userId)) || classDoc.owner.equals(userId);

    if (!isMember) {
        throw new ForbiddenRequestsException('User is not a member of this class', ErrorCode.FORBIDDEN);
    }

    let userClassState = await UserClassState.findOne({
        user: new Types.ObjectId(userId),
        class: new Types.ObjectId(classId)
    });

    if (!userClassState) {
        userClassState = new UserClassState({
            user: new Types.ObjectId(userId),
            class: new Types.ObjectId(classId),
            deck: new Types.ObjectId(deckId),
            completedCardIds: [],
            correctCount: 0,
            totalCount: 0,
            startTime: new Date()
        });
        await userClassState.save();
    }

    const allCards = await Card.find({ deck: new Types.ObjectId(deckId) }).lean();

    let session = await UserClassState.findOne({
        user: new Types.ObjectId(userId),
        class: new Types.ObjectId(classId),
        deck: new Types.ObjectId(deckId),
        endTime: { $exists: false }
    });

    if (!session && !forceNew) {
        session = await UserClassState.findOne({
            user: new Types.ObjectId(userId),
            class: new Types.ObjectId(classId),
            deck: new Types.ObjectId(deckId)
        }).sort({ createdAt: -1 });

        if (session) {
            session.endTime = undefined;
            await session.save();
        }
    }

    if (session && !forceNew) {
        const remainingCards = allCards.filter(
            (card) => !session!.completedCardIds.some((completedId) => completedId.toString() === card._id.toString())
        );

        if (remainingCards.length === 0) {
            session.endTime = new Date();
            await session.save();

            session = new UserClassState({
                user: new Types.ObjectId(userId),
                class: new Types.ObjectId(classId),
                deck: new Types.ObjectId(deckId),
                completedCardIds: [],
                correctCount: 0,
                totalCount: 0,
                startTime: new Date()
            });
            await session.save();

            return {
                session,
                cards: allCards,
                resumed: false
            };
        }

        const isResumed = session.completedCardIds.length > 0;

        return {
            session,
            cards: remainingCards,
            resumed: isResumed
        };
    }

    session = new UserClassState({
        user: new Types.ObjectId(userId),
        class: new Types.ObjectId(classId),
        deck: new Types.ObjectId(deckId),
        completedCardIds: [],
        correctCount: 0,
        totalCount: 0,
        startTime: new Date()
    });
    await session.save();

    return {
        session,
        cards: allCards,
        resumed: false
    };
};

export const saveClassDeckAnswerService = async (
    userId: string,
    classId: string,
    deckId: string,
    sessionId: string,
    cardId: string,
    correct: boolean
) => {
    const session = await UserClassState.findOne({
        _id: sessionId,
        user: new Types.ObjectId(userId),
        class: new Types.ObjectId(classId),
        deck: new Types.ObjectId(deckId)
    });

    if (!session) {
        throw new NotFoundException('Session not found', ErrorCode.NOT_FOUND);
    }

    if (!session.completedCardIds.includes(new Types.ObjectId(cardId))) {
        session.completedCardIds.push(new Types.ObjectId(cardId));

        if (correct) {
            session.correctCount += 1;
        }
        session.totalCount += 1;
    }

    await session.save();
    return session;
};

export const endClassDeckSessionService = async (
    userId: string,
    classId: string,
    deckId: string,
    sessionId: string,
    duration: number
) => {
    const session = await UserClassState.findOne({
        _id: sessionId,
        user: new Types.ObjectId(userId),
        class: new Types.ObjectId(classId),
        deck: new Types.ObjectId(deckId)
    });

    if (!session) {
        throw new NotFoundException('Session not found', ErrorCode.NOT_FOUND);
    }

    session.duration = duration;
    session.endTime = new Date();
    await session.save();

    return session;
};

export const getClassDeckSessionHistoryService = async (userId: string, classId: string, deckId: string) => {
    const sessions = await UserClassState.find({
        user: new Types.ObjectId(userId),
        class: new Types.ObjectId(classId),
        deck: new Types.ObjectId(deckId)
    }).sort({ startTime: -1 });

    return sessions;
};
