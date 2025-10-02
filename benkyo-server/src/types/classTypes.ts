import { Types } from 'mongoose';

export type ClassUserMongoType = {
    _id: Types.ObjectId;
    name: string;
    email: string;
    avatar: string;
};

export type ClassOwnerType = {
    _id: Types.ObjectId;
    name: string;
};

export type ClassDeckType = {
    _id: Types.ObjectId;
    name: string;
    description: string;
    cardCount: number;
    avgRating: number;
};

export type ClassDeckRefType = {
    deck: ClassDeckType;
    description: string;
    startTime: Date;
    endTime: Date;
};

export type ClassUserClassStateType = {
    _id: string;
    user: ClassUserMongoType;
    deck: Types.ObjectId | ClassDeckType;
    points: number;
    studyStreak: number;
    completedCardIds: Types.ObjectId[];
    updatedAt: Date;
};

export type ClassJoinRequestType = {
    user: Types.ObjectId;
    requestDate: Date;
    createdAt: Date;
    note: string;
};

export type ClassInvitedUserType = {
    user: Types.ObjectId;
    invitedAt: Date;
    invitedBy: Types.ObjectId;
};

export type ClassVisitType = {
    userId: Types.ObjectId;
    lastVisit: Date;
};

export type ClassType = {
    _id: string;
    name: string;
    description: string;
    bannerUrl?: string;
    owner: ClassOwnerType;
    visibility: 'public' | 'private';
    requiredApprovalToJoin: boolean;
    users: ClassUserMongoType[];
    decks: ClassDeckRefType[];
    userClassStates: ClassUserClassStateType[];
    joinRequests: ClassJoinRequestType[];
    invitedUsers: ClassInvitedUserType[];
    visited: ClassVisitType[];
    createdAt: Date;
    updatedAt: Date;
};

export type ClassAddDeckType = {
    classId: string;
    deckId: string;
    description: string;
    startTime: Date;
    endTime: Date;
    ownerId: string;
};

export type ClassUserType = {
    _id: string;
    name: string;
    description: string;
    users: {
        _id: string;
        name: string;
        email: string;
    }[];
    decks: ClassDeckProgressType[];
    owner: {
        _id: string;
        name: string;
    };
    visibility: 'public' | 'private';
    requiredApprovalToJoin: boolean;
    createdAt: Date;
    userClassStates: ClassUserStateDataType[];
    completionRate: number;
    bannerUrl?: string;
    visited: {
        history: string[];
    };
};

export type ClassDeckProgressType = {
    _id: string;
    name: string;
    cardCount: number;
    avgRating: number;
    description: string;
    startTime: Date;
    endTime: Date;
    correctCount: number;
    totalCount: number;
};

export type ClassUserStateDataType = {
    _id: string;
    user: {
        _id: string;
        name: string;
        avatar: string;
    };
    points: number;
    studyStreak: number;
    completedCardIds: string[];
};

export type InviteNotificationType = {
    notificationType: 'invite';
    sortTime: Date;
    priority: number;
    id: string;
    classId: string;
    className: string;
    description: string;
    type: string;
    createdAt: Date;
    message: string;
};

export type OverdueNotificationType = {
    notificationType: 'overdue';
    sortTime: Date;
    priority: number;
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
};

export type UpcomingNotificationType = {
    notificationType: 'upcoming';
    sortTime: Date;
    priority: number;
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
};

export type OverdueScheduleType = OverdueNotificationType;

export type MemberProgressType = {
    userId: string;
    userName: string;
    userEmail: string;
    userAvatar: string;
    overallProgress: number;
    overdueCount: number;
    upcomingCount: number;
    deckProgresses: {
        deckId: string;
        deckName: string;
        description: string;
        startTime: Date;
        endTime: Date;
        progress: number;
        totalCards: number;
        completedCards: number;
        isOverdue: boolean;
        hoursOverdue: number;
        hoursUntilDeadline: number;
    }[];
};

export type MemberLearningStatusType = {
    userId: string;
    userName: string;
    userEmail: string;
    userAvatar: string;
    totalDecks: number;
    completedDecks: number;
    inProgressDecks: number;
    notStartedDecks: number;
    overallProgress: number;
    lastStudyDate: Date;
    studyStreak: number;
    deckStatuses: {
        deckId: string;
        deckName: string;
        description: string;
        status: 'completed' | 'in_progress' | 'not_started';
        progress: number;
        totalCards: number;
        completedCards: number;
        lastStudyDate: Date;
        startTime: Date;
        endTime: Date;
        isOverdue: boolean;
        hoursOverdue: number;
        hoursUntilDeadline: number;
    }[];
};

export type MonthlyAccessStatsType = {
    month: string;
    visits: number;
    members: number;
    uniqueVisitors: number;
};

export type ClassVisited = {
    userId: Types.ObjectId;
    lastVisit: Date;
};
