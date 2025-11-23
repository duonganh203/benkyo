import { ForbiddenRequestsException } from '~/exceptions/forbiddenRequests';
import { NotFoundException } from '~/exceptions/notFound';
import { ErrorCode } from '~/exceptions/root';
import { Deck, PublicStatus, User, UserClassState, Card, Quiz, Class } from '~/schemas';
import { sendToUser } from '~/utils/socketServer';
import { ClassStateType } from '~/validations/classValidation';
import {
    InviteNotificationType,
    OverdueNotificationType,
    UpcomingNotificationType,
    OverdueScheduleType,
    MemberProgressType,
    MemberLearningStatusType,
    MonthlyAccessStatsType,
    ClassAddDeckType,
    ClassType
} from '~/types/classTypes';
import { BadRequestsException } from '~/exceptions/badRequests';
import { ConflictException } from '~/exceptions/conflictException';
import { Types } from 'mongoose';

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

export const classUpdateService = async (classId: string, userId: Types.ObjectId, data: ClassStateType) => {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundException('User not found', ErrorCode.NOT_FOUND);

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
        bannerUrl: updatedClass.bannerUrl,
        visibility: updatedClass.visibility,
        requiredApprovalToJoin: updatedClass.requiredApprovalToJoin,
        owner: updatedClass.owner.toString()
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
    const user = await User.findById(userId);
    if (!user) throw new NotFoundException('User not found', ErrorCode.NOT_FOUND);

    const existingClass = await Class.findById(classId);
    if (!existingClass) throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);

    if (!existingClass.owner.equals(userId))
        throw new ForbiddenRequestsException('You do not have permission to update this class', ErrorCode.FORBIDDEN);

    return {
        name: existingClass.name,
        description: existingClass.description,
        bannerUrl: existingClass.bannerUrl,
        visibility: existingClass.visibility,
        requiredApprovalToJoin: existingClass.requiredApprovalToJoin,
        owner: existingClass.owner.toString()
    };
};

export const getMyClassListService = async (userId: Types.ObjectId, page: number, limit: number, search?: string) => {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundException('User not found', ErrorCode.NOT_FOUND);

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

export const classRequestJoinsService = async (classId: string, userId: Types.ObjectId) => {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundException('User not found', ErrorCode.NOT_FOUND);

    const existingClass = await Class.findById(classId);
    if (!existingClass) throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);

    const alreadyMember = existingClass.users.some((user) => user.equals(userId));
    if (alreadyMember) throw new ConflictException('Already a member of this class', ErrorCode.CONFLICT);

    if (!existingClass.requiredApprovalToJoin) {
        existingClass.users.push(new Types.ObjectId(userId));
        await existingClass.save();
        return { message: 'Joined class successfully' };
    }

    const alreadyRequested = existingClass.joinRequests.some((req) => req.user.equals(userId));
    if (alreadyRequested)
        throw new ConflictException('You have already requested to join this class', ErrorCode.CONFLICT);

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

    const todayStr = new Date().toISOString().split('T')[0];
    const visitHistory = existingClass.visited || [];

    const alreadyVisitedToday = visitHistory.some((visit) => {
        const visitDate = new Date(visit.lastVisit).toISOString().split('T')[0];
        return visit.userId.toString() === userId.toString() && visitDate === todayStr;
    });

    if (!alreadyVisitedToday) {
        await Class.updateOne({ _id: classId }, { $push: { visited: { userId: userId, lastVisit: new Date() } } });
    }
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
}: ClassAddDeckType) => {
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

export const getClassUserByIdService = async (classId: string, userId: string) => {
    const existingClass = await Class.findById(classId)
        .select(
            'name description owner users decks bannerUrl requiredApprovalToJoin userClassStates createdAt status visibility visited'
        )
        .populate('owner', '_id name')
        .populate('users', 'name email')
        .populate({ path: 'decks.deck', select: 'name cardCount avgRating' })
        .populate({
            path: 'userClassStates',
            populate: { path: 'user', select: '_id name email avatar' }
        })
        .lean<ClassType>()
        .exec();

    if (!existingClass) throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);

    await updateClassVisitedHistory(classId, new Types.ObjectId(userId));

    const deckRefs = existingClass.decks || [];
    const deckIds = deckRefs.map((d) => d.deck._id);

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

    const decks = deckRefs.map((d) => {
        const progress = progressMap.get(d.deck._id.toString()) || {
            correctCount: 0,
            totalCount: 0
        };

        const actualTotalCount = progress.totalCount > 0 ? progress.totalCount : d.deck.cardCount;

        return {
            _id: d.deck._id.toString(),
            name: d.deck.name,
            cardCount: d.deck.cardCount,
            avgRating: d.deck.avgRating || 0,
            description: d.description || '',
            startTime: d.startTime,
            endTime: d.endTime,
            correctCount: progress.correctCount,
            totalCount: actualTotalCount
        };
    });

    const scheduledDecks = decks.filter((deck) => deck.startTime && deck.endTime);
    let completionRate = 0;

    if (scheduledDecks.length > 0) {
        const totalProgress = scheduledDecks.reduce((sum, deck) => {
            const deckProgress = deck.totalCount > 0 ? (deck.correctCount / deck.totalCount) * 100 : 0;
            return sum + deckProgress;
        }, 0);
        completionRate = Math.round(totalProgress / scheduledDecks.length);
    }

    const sortedTopUserStates = existingClass.userClassStates
        .filter((ucs) => ucs.user._id.toString() !== existingClass.owner._id.toString())
        .sort((a, b) => b.points - a.points)
        .slice(0, 5);

    return {
        _id: existingClass._id.toString(),
        name: existingClass.name,
        description: existingClass.description,
        users: existingClass.users.map((u) => ({
            _id: u._id.toString(),
            name: u.name,
            email: u.email
        })),
        decks,
        owner: {
            _id: existingClass.owner._id.toString(),
            name: existingClass.owner.name
        },
        visibility: existingClass.visibility,
        requiredApprovalToJoin: existingClass.requiredApprovalToJoin,
        createdAt: existingClass.createdAt,
        userClassStates: sortedTopUserStates.map((state) => ({
            _id: state._id.toString(),
            user: {
                _id: state.user._id.toString(),
                name: state.user.name,
                avatar: state.user.avatar || ''
            },
            points: state.points,
            studyStreak: state.studyStreak,
            completedCardIds: state.completedCardIds.map((id) => id.toString())
        })),
        completionRate,
        visited: {
            history: (existingClass.visited ?? []).map((v) => v.userId.toString())
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
        .lean<ClassType[]>();

    const overdueSchedules: OverdueScheduleType[] = [];

    for (const classItem of userClasses) {
        if (!classItem.decks) continue;

        const scheduledDecks = classItem.decks.filter(
            (d) => d.startTime && d.endTime && new Date(d.endTime) < currentDate && new Date(d.endTime) >= oneDayAgo
        );

        for (const deckRef of scheduledDecks) {
            const deck = deckRef.deck;
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
                    notificationType: 'overdue',
                    sortTime: new Date(deckRef.endTime),
                    priority: 1,
                    classId: classItem._id.toString(),
                    className: classItem.name,
                    deckId: deck._id.toString(),
                    deckName: deck.name,
                    description: deckRef.description,
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

    const upcomingDeadlines: UpcomingNotificationType[] = [];

    for (const classItem of userClasses) {
        const decks = Array.isArray(classItem.decks) ? classItem.decks : [];

        for (const deckRef of decks) {
            const endTimeRaw = deckRef.endTime;
            const startTimeRaw = deckRef.startTime;

            if (!endTimeRaw || !startTimeRaw) continue;

            const endTime = new Date(endTimeRaw);
            if (endTime <= currentDate || endTime > nextWeek) continue;

            const deck = deckRef.deck as { _id: Types.ObjectId; name?: string; cardCount?: number };

            const userState = await UserClassState.findOne({
                user: userId,
                class: classItem._id,
                deck: deck._id
            });

            const totalCards = deck.cardCount ?? 0;
            const completedCards = userState?.completedCardIds?.length ?? 0;
            const progress = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

            const hoursUntilDeadline = Math.floor((endTime.getTime() - currentDate.getTime()) / (1000 * 60 * 60));

            upcomingDeadlines.push({
                notificationType: 'upcoming',
                sortTime: endTime,
                priority: 1,
                classId: classItem._id.toString(),
                className: classItem.name,
                deckId: deck._id.toString(),
                deckName: deck.name ?? 'Untitled Deck',
                description: deckRef.description ?? '',
                endTime,
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

const getJoinRequestNotificationsService = async (userId: Types.ObjectId) => {
    const classes = await Class.find({
        owner: userId,
        'joinRequests.0': { $exists: true }
    })
        .select('_id name description joinRequests')
        .populate({ path: 'joinRequests.user', select: '_id name email avatar' })
        .lean();

    if (!classes || classes.length === 0) return [];

    const notifications = classes.flatMap((cls) => {
        return (cls.joinRequests || []).map((req) => {
            const u = req.user as any;
            const requestUserId = (u?._id || req.user)?.toString();
            const createdAt = req.requestDate ? new Date(req.requestDate) : new Date();

            return {
                id: `${cls._id.toString()}:${requestUserId}`,
                classId: cls._id.toString(),
                className: cls.name,
                description: cls.description,
                type: 'join_request',
                createdAt,
                message: `${u?.name || 'A user'} requested to join class: ${cls.name}`,
                requestUserId,
                requestUserName: u?.name || '',
                requestUserEmail: u?.email || '',
                requestUserAvatar: u?.avatar || ''
            };
        });
    });

    return notifications;
};

export const getAllNotificationsService = async (userId: Types.ObjectId) => {
    const [inviteNotifications, joinRequestNotifications, overdueSchedules, upcomingDeadlines] = await Promise.all([
        getInviteClassService(userId),
        getJoinRequestNotificationsService(userId),
        getOverdueSchedulesService(userId),
        getUpcomingDeadlinesService(userId)
    ]);

    const normalizedInvites: InviteNotificationType[] = inviteNotifications.map((invite) => ({
        ...invite,
        notificationType: 'invite',
        sortTime: new Date(invite.createdAt || new Date()),
        priority: 2
    }));

    const normalizedJoinRequests = joinRequestNotifications.map((jr) => ({
        ...jr,
        notificationType: 'join_request' as const,
        sortTime: new Date(jr.createdAt || new Date()),
        priority: 2
    }));

    const normalizedOverdue: OverdueNotificationType[] = overdueSchedules.map((schedule) => ({
        ...schedule,
        notificationType: 'overdue',
        sortTime: new Date(schedule.endTime),
        priority: 1
    }));

    const normalizedUpcoming: UpcomingNotificationType[] = upcomingDeadlines.map((deadline) => ({
        ...deadline,
        notificationType: 'upcoming',
        sortTime: new Date(deadline.endTime),
        priority: deadline.hoursUntilDeadline <= 24 ? 3 : 4
    }));

    const allNotifications = [
        ...normalizedInvites,
        ...normalizedJoinRequests,
        ...normalizedOverdue,
        ...normalizedUpcoming
    ].sort((a, b) => {
        if (a.notificationType === 'invite' && b.notificationType === 'invite') {
            return new Date(b.sortTime).getTime() - new Date(a.sortTime).getTime();
        }
        return a.priority - b.priority;
    });

    return {
        all: allNotifications,
        invites: [...inviteNotifications, ...joinRequestNotifications],
        schedules: {
            overdue: overdueSchedules,
            upcoming: upcomingDeadlines,
            criticalUpcoming: upcomingDeadlines.filter((d) => d.hoursUntilDeadline <= 24)
        },
        summary: {
            totalInvites: inviteNotifications.length,
            totalJoinRequests: joinRequestNotifications.length,
            totalOverdue: overdueSchedules.length,
            totalUpcoming: upcomingDeadlines.length,
            totalCritical: upcomingDeadlines.filter((d) => d.hoursUntilDeadline <= 24).length,
            totalAll:
                inviteNotifications.length +
                joinRequestNotifications.length +
                overdueSchedules.length +
                upcomingDeadlines.length
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

export const getClassMemberProgressService = async (classId: string, requesterId: Types.ObjectId) => {
    void requesterId;
    const existingClass = await Class.findById(classId)
        .populate({ path: 'users', select: '_id name email avatar' })
        .populate({ path: 'decks.deck', select: '_id name description cardCount' })
        .lean<ClassType>();

    if (!existingClass) throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);

    const memberProgresses: MemberProgressType[] = [];

    for (const member of existingClass.users) {
        const userClassStates = await UserClassState.find({
            user: member._id,
            class: classId
        }).populate('deck', '_id name description cardCount');

        const deckProgresses = existingClass.decks.map((classDeck) => {
            const userClassState = userClassStates.find(
                (ucs) => ucs.deck && '_id' in ucs.deck && ucs.deck._id.equals(classDeck.deck._id)
            );

            const totalCards = classDeck.deck.cardCount ?? 0;
            const completedCards = userClassState?.completedCardIds?.length ?? 0;
            const progress = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;
            const now = new Date();

            const isOverdue = now > classDeck.endTime;
            const hoursOverdue = isOverdue
                ? Math.floor((now.getTime() - classDeck.endTime.getTime()) / (1000 * 60 * 60))
                : 0;
            const hoursUntilDeadline = !isOverdue
                ? Math.floor((classDeck.endTime.getTime() - now.getTime()) / (1000 * 60 * 60))
                : 0;

            return {
                deckId: classDeck.deck._id.toString(),
                deckName: classDeck.deck.name,
                description: classDeck.description ?? '',
                startTime: classDeck.startTime,
                endTime: classDeck.endTime,
                progress,
                totalCards,
                completedCards,
                isOverdue,
                hoursOverdue,
                hoursUntilDeadline
            };
        });

        const overdueCount = deckProgresses.filter((dp) => dp.isOverdue).length;
        const upcomingCount = deckProgresses.filter((dp) => !dp.isOverdue && dp.hoursUntilDeadline <= 24).length;
        const overallProgress =
            deckProgresses.length > 0
                ? Math.round(deckProgresses.reduce((sum, dp) => sum + dp.progress, 0) / deckProgresses.length)
                : 0;

        memberProgresses.push({
            userId: member._id.toString(),
            userName: member.name,
            userEmail: member.email,
            userAvatar: member.avatar,
            overallProgress,
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
export const getOverdueMemberCountService = async (classId: string, userId: Types.ObjectId) => {
    const existingClass = await Class.findById(classId).select('owner users decks').lean();
    if (!existingClass) throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);
    if (existingClass.owner.toString() !== userId.toString())
        throw new ForbiddenRequestsException('You do not have permission to manage this class', ErrorCode.FORBIDDEN);

    const now = new Date();
    const overdueDeckIds = (existingClass.decks ?? [])
        .filter((d) => d.endTime && new Date(d.endTime) < now)
        .map((d) => d.deck.toString());
    const userIds = (existingClass.users ?? []).map((u: Types.ObjectId) => u);
    if (overdueDeckIds.length === 0 || userIds.length === 0) return 0;

    const states = await UserClassState.find({
        class: classId,
        user: { $in: userIds },
        deck: { $in: overdueDeckIds }
    })
        .select('user deck correctCount totalCount updatedAt')
        .lean();

    const latest = new Map<string, Map<string, { correct: number; total: number; updatedAt: number }>>();
    for (const s of states) {
        const uid = s.user.toString();
        const did = s.deck.toString();
        if (!latest.has(uid)) latest.set(uid, new Map());
        const cur = latest.get(uid)!.get(did);
        const ts = new Date(s.updatedAt || s._id.getTimestamp?.() || Date.now()).getTime();
        if (!cur || ts > cur.updatedAt)
            latest.get(uid)!.set(did, { correct: s.correctCount || 0, total: s.totalCount || 0, updatedAt: ts });
    }

    let count = 0;
    for (const u of userIds) {
        const uid = u.toString();
        const perDeck = latest.get(uid) || new Map();
        const isOverdue = overdueDeckIds.some((did) => {
            const st = perDeck.get(did);
            if (!st) return true;
            return (st.correct || 0) !== (st.total || 0);
        });
        if (isOverdue) count++;
    }

    return count;
};

const assertOwner = async (classId: string, userId: Types.ObjectId) => {
    const doc = await Class.findById(classId).select('_id owner').lean();
    if (!doc) throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);
    if (!doc.owner || doc.owner.toString() !== userId.toString())
        throw new ForbiddenRequestsException('You do not have permission to manage this class', ErrorCode.FORBIDDEN);
    return doc;
};

export const getClassUsersService = async (classId: string, userId: Types.ObjectId) => {
    await assertOwner(classId, userId);
    const c = await Class.findById(classId).select('users').lean();
    if (!c) throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);
    const ids = (c.users ?? []).map((u: Types.ObjectId) => u);
    if (ids.length === 0) return [];
    const users = await User.find({ _id: { $in: ids } })
        .select('_id name email avatar')
        .lean();
    const order = new Map(ids.map((id, i) => [id.toString(), i]));
    return users.sort((a, b) => order.get(a._id.toString())! - order.get(b._id.toString())!);
};

export const getClassJoinRequestsService = async (classId: string, userId: Types.ObjectId) => {
    await assertOwner(classId, userId);

    const c = await Class.findById(classId).select('joinRequests').lean();
    if (!c) throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);

    const rows = (c.joinRequests ?? []).map((x) => ({
        userId: x.user.toString(),
        requestDate: x.requestDate
    }));

    if (rows.length === 0) return [];

    const users = await User.find({ _id: { $in: rows.map((r) => r.userId) } })
        .select('_id name email avatar')
        .lean();

    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    return rows.map((r) => ({
        user: userMap.get(r.userId) ?? null,
        createdAt: r.requestDate
    }));
};

export const getClassUserStatesService = async (classId: string, userId: Types.ObjectId) => {
    await assertOwner(classId, userId);
    const states = await UserClassState.find({ class: classId })
        .select('_id class user deck completedCardIds progress createdAt updatedAt')
        .lean();
    if (states.length === 0) return [];
    const userIds = Array.from(new Set(states.map((s) => s.user.toString()))).map((id) => new Types.ObjectId(id));
    const users = await User.find({ _id: { $in: userIds } })
        .select('_id name email avatar')
        .lean();
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));
    return states.map((s) => ({ ...s, user: userMap.get(s.user.toString()) }));
};

export const getClassInvitedUsersService = async (classId: string, userId: Types.ObjectId) => {
    await assertOwner(classId, userId);
    const c = await Class.findById(classId).select('invitedUsers').lean();
    if (!c) throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);
    const rows = (c.invitedUsers ?? []).map((x) => ({
        userId: x.user,
        invitedAt: x.invitedAt,
        invitedBy: x.user
    }));
    if (rows.length === 0) return [];
    const ids = rows.map((r) => r.userId);
    const users = await User.find({ _id: { $in: ids } })
        .select('_id name email avatar')
        .lean();
    const map = new Map(users.map((u) => [u._id.toString(), u]));
    return rows.map((r) => ({ user: map.get(r.userId.toString()), invitedAt: r.invitedAt, invitedBy: r.invitedBy }));
};

export const getClassMemberLearningStatusService = async (classId: string, requesterId: Types.ObjectId) => {
    void requesterId;
    const existingClass = await Class.findById(classId)
        .populate({
            path: 'users',
            select: '_id name email avatar'
        })
        .populate({
            path: 'decks.deck',
            select: '_id name description cardCount'
        })
        .lean<ClassType>();

    if (!existingClass) throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);

    const memberStatuses: MemberLearningStatusType[] = [];

    for (const member of existingClass.users) {
        const userClassStates = await UserClassState.find({
            user: member._id,
            class: classId
        }).populate('deck', '_id name description cardCount');

        const deckStatuses = existingClass.decks.map((classDeck) => {
            const ucs = userClassStates.find((ucs) => ucs.deck.toString() === classDeck.deck.toString());

            const totalCards = classDeck.deck.cardCount ?? 0;
            const completedCards = ucs?.completedCardIds?.length || 0;
            const progress = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

            let status: 'completed' | 'in_progress' | 'not_started';
            if (progress === 100) status = 'completed';
            else if (completedCards > 0) status = 'in_progress';
            else status = 'not_started';

            const endTime = classDeck.endTime ? new Date(classDeck.endTime) : new Date(0);
            const startTime = classDeck.startTime ? new Date(classDeck.startTime) : new Date(0);
            const isOverdue = endTime ? new Date() > endTime : false;
            const hoursOverdue = isOverdue ? Math.floor((Date.now() - endTime.getTime()) / (1000 * 60 * 60)) : 0;
            const hoursUntilDeadline = !isOverdue ? Math.floor((endTime.getTime() - Date.now()) / (1000 * 60 * 60)) : 0;

            return {
                deckId: classDeck.deck._id.toString(),
                deckName: classDeck.deck.name,
                description: classDeck.description,
                status,
                progress,
                totalCards,
                completedCards,
                lastStudyDate: ucs?.updatedAt ?? new Date(0),
                startTime,
                endTime,
                isOverdue,
                hoursOverdue,
                hoursUntilDeadline
            };
        });

        const completedDecks = deckStatuses.filter((ds) => ds.status === 'completed').length;
        const inProgressDecks = deckStatuses.filter((ds) => ds.status === 'in_progress').length;
        const notStartedDecks = deckStatuses.filter((ds) => ds.status === 'not_started').length;
        const totalDecks = deckStatuses.length;
        const overallProgress = totalDecks > 0 ? Math.round((completedDecks / totalDecks) * 100) : 0;

        const updatedAtTimes = userClassStates.map((ucs) => ucs.updatedAt?.getTime()).filter(Boolean);
        const lastStudyDate = updatedAtTimes.length > 0 ? new Date(Math.max(...updatedAtTimes)) : new Date(0);

        const studyStreak = userClassStates.length;

        memberStatuses.push({
            userId: member._id.toString(),
            userName: member.name,
            userEmail: member.email,
            userAvatar: member.avatar,
            totalDecks,
            completedDecks,
            inProgressDecks,
            notStartedDecks,
            overallProgress,
            lastStudyDate,
            studyStreak,
            deckStatuses
        });
    }

    return memberStatuses;
};

export const getClassMonthlyAccessStatsService = async (classId: string, requesterId: Types.ObjectId) => {
    await assertOwner(classId, requesterId);

    const existingClass = await Class.findById(classId)
        .populate({
            path: 'visited.userId',
            select: '_id email username avatar'
        })
        .populate({
            path: 'users',
            select: '_id name email avatar'
        })
        .lean<ClassType>();

    if (!existingClass) {
        throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);
    }

    const currentDate = new Date();
    const monthlyStats: MonthlyAccessStatsType[] = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 11; i >= 0; i--) {
        const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthName = monthNames[targetDate.getMonth()];

        const visitsInMonth =
            existingClass.visited?.filter((visit) => {
                const visitDate = new Date(visit.lastVisit);
                return (
                    visitDate.getMonth() === targetDate.getMonth() &&
                    visitDate.getFullYear() === targetDate.getFullYear()
                );
            }).length || 0;

        const uniqueMembersByMonth = new Set();

        existingClass.visited?.forEach((visit) => {
            const visitDate = new Date(visit.lastVisit);
            const visitMonth = new Date(visitDate.getFullYear(), visitDate.getMonth(), 1);
            const targetMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);

            if (visitMonth <= targetMonth) {
                uniqueMembersByMonth.add(visit.userId._id.toString());
            }
        });

        const cumulativeMembersInMonth = uniqueMembersByMonth.size;

        const uniqueVisitorsInMonth = new Set(
            existingClass.visited
                ?.filter((visit) => {
                    const visitDate = new Date(visit.lastVisit);
                    return (
                        visitDate.getMonth() === targetDate.getMonth() &&
                        visitDate.getFullYear() === targetDate.getFullYear()
                    );
                })
                .map((visit) => visit.userId._id.toString())
        ).size;

        monthlyStats.push({
            month: monthName,
            visits: visitsInMonth,
            members: cumulativeMembersInMonth,
            uniqueVisitors: uniqueVisitorsInMonth
        });
    }

    return monthlyStats;
};

export const getClassMembersService = async (classId: string, userId: Types.ObjectId, page: number, limit: number) => {
    await assertOwner(classId, userId);

    const classData = await Class.findById(classId).select('users').lean();

    if (!classData) {
        throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);
    }

    const allUserIds = (classData.users ?? []) as Types.ObjectId[];
    const total = allUserIds.length;

    const safePage = page > 0 ? page : 1;
    const safeLimit = limit > 0 ? limit : 5;
    const start = (safePage - 1) * safeLimit;
    const end = start + safeLimit;

    const pageUserIds = allUserIds.slice(start, end);

    if (pageUserIds.length === 0) {
        return {
            data: [],
            page: safePage,
            hasMore: false,
            total
        };
    }

    const users = await User.find({ _id: { $in: pageUserIds } })
        .select('_id name email avatar')
        .lean();

    const order = new Map(pageUserIds.map((id, index) => [id.toString(), index]));
    const sortedUsers = users.sort((a, b) => (order.get(a._id.toString()) ?? 0) - (order.get(b._id.toString()) ?? 0));

    const hasMore = end < total;

    return {
        data: sortedUsers,
        page: safePage,
        hasMore,
        total
    };
};

export const getClassDecksService = async (classId: string, userId: Types.ObjectId) => {
    await assertOwner(classId, userId);

    const classData = await Class.findById(classId).populate({
        path: 'decks.deck',
        select: '_id name description cardCount'
    });

    if (!classData) {
        throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);
    }

    return classData.decks || [];
};

export const getClassInvitedService = async (classId: string, userId: Types.ObjectId) => {
    await assertOwner(classId, userId);

    const classData = await Class.findById(classId).populate({
        path: 'invitedUsers.user',
        select: '_id email name avatar'
    });

    if (!classData) {
        throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);
    }

    return classData.invitedUsers || [];
};

export const getClassRequestJoinService = async (classId: string, userId: Types.ObjectId) => {
    await assertOwner(classId, userId);

    const classData = await Class.findById(classId).populate({
        path: 'joinRequests.user',
        select: '_id email name avatar'
    });

    if (!classData) {
        throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);
    }

    return classData.joinRequests || [];
};

export const getClassVisitedService = async (classId: string, userId: Types.ObjectId) => {
    await assertOwner(classId, userId);

    const classData = await Class.findById(classId).populate({
        path: 'visited.userId',
        select: '_id email name avatar'
    });

    if (!classData) {
        throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);
    }

    return classData.visited || [];
};

export const getClassManagementService = async (classId: string, userId: Types.ObjectId) => {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundException('User not found', ErrorCode.NOT_FOUND);

    const existingClass = await Class.findById(classId).populate('owner', '_id name');
    if (!existingClass) throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);
    if (existingClass.owner._id.toString() !== userId.toString())
        throw new ForbiddenRequestsException('You do not have permission to manage this class', ErrorCode.FORBIDDEN);

    const overdueMemberCount = await getOverdueMemberCountService(classId, userId);

    const visitedHistory = (existingClass.visited ?? [])
        .slice()
        .sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime())
        .map((v) => ({ userId: v.userId, lastVisit: v.lastVisit }));

    return {
        _id: existingClass._id,
        name: existingClass.name,
        bannerUrl: existingClass.bannerUrl,
        description: existingClass.description,
        visibility: existingClass.visibility,
        owner: existingClass.owner,
        users: existingClass.users,
        decks: existingClass.decks,
        visited: visitedHistory,
        joinRequests: existingClass.joinRequests,
        invitedUsers: existingClass.invitedUsers,
        requiredApprovalToJoin: existingClass.requiredApprovalToJoin,
        createdAt: existingClass.createdAt,
        updatedAt: existingClass.updatedAt,
        overdueMemberCount
    };
};
