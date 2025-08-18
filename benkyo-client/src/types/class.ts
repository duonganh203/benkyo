import type { ClassNotification } from './notification';

export type ClassUserRequestDto = {
    name: string;
    description: string;
    bannerUrl: string;
    visibility: 'public' | 'private';
    requiredApprovalToJoin: boolean;
    message?: string;
};

export type ClassUserResponseDto = {
    _id: string;
    name: string;
    description: string;
    owner: string;
    bannerUrl: string;
    visibility: 'public' | 'private';
    requiredApprovalToJoin: boolean;
};

export type ClassListItemUserResponseDto = {
    _id: string;
    name: string;
    description: string;
    owner: string;
    bannerUrl: string;
    progress: number;
    requiredApprovalToJoin: boolean;
    createdAt: Date;
};

export type ClassJoinResponseDto = {
    message: string;
};

export type ClassJoinRequestDto = {
    classId: string;
};

export type ClassRejectRequestJoinDto = {
    classId: string;
    userId: string;
};

export type ClassAcceptRequestJoinDto = {
    classId: string;
    userId: string;
};

export type PopulatedUser = {
    _id: string;
    name: string;
    email: string;
    avatar: string;
};

export type JoinRequest = {
    _id: string;
    user: PopulatedUser;
    requestDate: Date;
};

export type ClassDeck = {
    deck: ClassDeckSummary;
    description?: string;
    startTime?: Date;
    endTime?: Date;
};

export type ClassDeckSummary = {
    _id: string;
    name: string;
    description?: string;
    owner: string;
    cardCount: number;
};

export type ClassUser = {
    _id: string;
    name: string;
    email: string;
    avatar: string;
};

export type ClassJoinRequest = {
    _id: string;
    user: ClassUser;
    requestDate: Date;
};

export type ClassVisitEntry = {
    userId: ClassUser | null;
    lastVisit: string;
};

export type ClassVisited = {
    count: number;
    history: ClassVisitEntry[];
};

export type ClassUserState = {
    _id: string;
    user: string;
    class: string;
    points: number;
    studyStreak: number;
    lastStudyDate?: Date;
    createdAt: Date;
    updatedAt: Date;
};

export type ClassUserStatePopulated = Omit<ClassUserState, 'user'> & {
    user: ClassUser;
};

export type ClassDeckItem = {
    _id: string;
    deck: string;
    description: string;
    startTime: string;
    endTime: string;
};

export type ClassVisitItem = {
    lastVisit: string;
};

export type ClassJoinRequestItem = {
    _id: string;
    user: ClassUser;
    requestDate: string;
};

export type ClassInvitedUserItem = {
    _id: string;
    user: ClassUser;
    invitedAt: string;
};
export type ClassOwnerItem = {
    _id: string;
    email: string;
};

export type ClassManagementResponseDto = {
    _id: string;
    name: string;
    description: string;
    visibility: 'public' | 'private';
    owner: ClassOwnerItem;
    users: string[];
    decks: ClassDeckItem[];
    visited: ClassVisitItem[];
    joinRequests: ClassJoinRequestItem[];
    invitedUsers: ClassInvitedUserItem[];
    requiredApprovalToJoin: boolean;
    createdAt: string;
    updatedAt: string;
    overdueMemberCount: number;
    bannerUrl?: string;
};

export type InviteMemberResponseDto = {
    message: string;
};

export type InviteMemberClassRequestDto = {
    classId: string;
    inviteEmail: string;
};

export type AcceptRejectInviteClassRequestDto = {
    classId: string;
};

export type AcceptRejectInviteClassResponseDto = {
    message: string;
};

export type RemoveUserClassRequestDto = {
    classId: string;
    userId: string;
};
export type RemoveUserClassResponseDto = {
    message: string;
};

export type RemoveDeckClassRequestDto = {
    classId: string;
    deckId: string;
};
export type RemoveDeckClassResponseDto = {
    message: string;
};

export type AddDeckToClassRequestDto = {
    classId: string;
    deckId: string;
    description?: string;
    startTime?: Date;
    endTime?: Date;
};

export type AddDeckToClassResponseDto = {
    message: string;
};

export type DeckToAddClassResponseDto = {
    _id: string;
    name: string;
    description: string;
};

export interface DeckInClass {
    _id: string;
    name: string;
    description?: string;
    cardCount: number;
    avgRating?: number;
    startTime?: Date;
    endTime?: Date;
    correctCount?: number;
    totalCount?: number;
}

export type TopLearner = {
    id: string;
    name: string;
    avatar: string;
    points: number;
    streak: number;
};

export type GetClassUserByIdResponseDto = {
    _id: string;
    name: string;
    description: string;
    users: ClassUser[];
    decks: DeckInClass[];
    owner: {
        _id: string;
        name: string;
    };
    visibility: 'public' | 'private';
    requiredApprovalToJoin: boolean;
    createdAt: Date;
    userClassStates: ClassUserStatePopulated[];
    completionRate: number;
    bannerUrl: string;
    visited: {
        history: {
            userId: string;
            lastVisit: string;
        }[];
    };
};

export type ClassStudySession = {
    _id: string;
    user: string;
    class: string;
    deck: string;
    completedCardIds: string[];
    correctCount: number;
    totalCount: number;
    startTime: Date;
    endTime?: Date;
    duration?: number;
    createdAt: Date;
    updatedAt: Date;
};

export type ClassStudySessionHistory = {
    _id: string;
    correctCount: number;
    totalCount: number;
    startTime: string;
    endTime: string;
    duration: number;
};

export type ClassStudyCard = {
    _id: string;
    front: string;
    back: string;
    tags?: string[];
    media?: ClassCardMedia[];
};

export type ClassCardMedia = {
    type: 'image' | 'audio' | 'video';
    url: string;
    filename?: string;
};

export type StartClassDeckSessionResponseDto = {
    session: ClassStudySession;
    cards: ClassStudyCard[];
    resumed: boolean;
    message?: string;
};

export type SaveClassDeckAnswerRequestDto = {
    sessionId: string;
    cardId: string;
    correct: boolean;
};

export type SaveClassDeckAnswerResponseDto = ClassStudySession;

export type EndClassDeckSessionRequestDto = {
    sessionId: string;
    duration: number;
};

export type EndClassDeckSessionResponseDto = ClassStudySession;

export type OverdueSchedule = {
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

export type UpcomingDeadline = {
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

export type ScheduleNotification = OverdueSchedule | UpcomingDeadline;

export type NormalizedInviteNotification = ClassNotification & {
    notificationType: 'invite';
    sortTime: Date;
    priority: number;
};

export type NormalizedOverdueNotification = OverdueSchedule & {
    notificationType: 'overdue';
    sortTime: Date;
    priority: number;
};

export type NormalizedUpcomingNotification = UpcomingDeadline & {
    notificationType: 'upcoming';
    sortTime: Date;
    priority: number;
};

export type UnifiedNotification =
    | NormalizedInviteNotification
    | NormalizedOverdueNotification
    | NormalizedUpcomingNotification;

export type AllNotificationsResponse = {
    all: UnifiedNotification[];
    invites: ClassNotification[];
    schedules: {
        overdue: OverdueSchedule[];
        upcoming: UpcomingDeadline[];
        criticalUpcoming: UpcomingDeadline[];
    };
    summary: {
        totalInvites: number;
        totalOverdue: number;
        totalUpcoming: number;
        totalCritical: number;
        totalAll: number;
    };
};

export type MemberDeckProgress = {
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
};

export type MemberProgress = {
    userId: string;
    userName: string;
    userEmail: string;
    userAvatar: string;
    overallProgress: number;
    overdueCount: number;
    upcomingCount: number;
    deckProgresses: MemberDeckProgress[];
};

export type ClassMemberProgressResponse = {
    success: boolean;
    data: MemberProgress[];
    message: string;
};

// New types for API responses - direct return without data wrapper
export type ClassUsersResponse = ClassUser[];

export type ClassJoinRequestsResponse = {
    user: ClassUser | null;
    createdAt: Date;
}[];

export type ClassUserStatesResponse = {
    _id: string;
    class: string;
    user: ClassUser;
    deck: string;
    completedCardIds: string[];
    progress: number;
    createdAt: Date;
    updatedAt: Date;
}[];

export type ClassInvitedUsersResponse = {
    user: ClassUser | null;
    invitedAt: Date;
    invitedBy: string;
}[];

export type MemberLearningStatus = {
    deckId: string;
    deckName: string;
    description?: string;
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
};

export type MemberLearningStatusResponse = {
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
    deckStatuses: MemberLearningStatus[];
}[];

export type MonthlyAccessStats = {
    month: string;
    visits: number;
    members: number;
    uniqueVisitors: number;
};

export type ClassMonthlyAccessStatsResponse = MonthlyAccessStats[];

export type ClassMembersResponse = ClassUser[];

export type ClassDecksResponse = {
    _id: string;
    deck: {
        _id: string;
        name: string;
        description?: string;
        cardCount?: number;
    };
    description?: string;
    startTime?: Date;
    endTime?: Date;
}[];

export type ClassInvitedResponse = {
    _id: string;
    user: ClassUser;
    invitedAt: Date;
}[];

export type ClassRequestJoinResponse = {
    _id: string;
    user: ClassUser;
    requestDate: string;
}[];

export type ClassVisitedResponse = {
    _id: string;
    userId: ClassUser;
    lastVisit: string;
}[];
