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
    message?: string;
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

export type ClassManagementResponseDto = {
    _id: string;
    name: string;
    description: string;
    bannerUrl: string;
    owner: ClassUser;
    visibility: 'public' | 'private';
    requiredApprovalToJoin: boolean;
    users: ClassUser[];
    joinRequests: ClassJoinRequest[];
    visited: ClassVisited;
    decks: ClassDeck[];
    userClassStates: ClassUserStatePopulated[];
    createdAt: Date;
    updatedAt: Date;
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

export type GetClassUserByIdResponseDto = {
    _id: string;
    name: string;
    description: string;
    users: ClassUser[];
    decks: {
        _id: string;
        name: string;
        description: string;
        cardCount: number;
        startTime: Date;
        endTime: Date;
    }[];
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
        history: string[];
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

export type StartClassDeckSessionResponseDto = {
    success: boolean;
    data: ClassStudySession;
    cards: any[];
    resumed: boolean;
    message?: string;
};

export type SaveClassDeckAnswerRequestDto = {
    sessionId: string;
    cardId: string;
    correct: boolean;
};

export type SaveClassDeckAnswerResponseDto = {
    success: boolean;
    data: ClassStudySession;
};

export type EndClassDeckSessionRequestDto = {
    sessionId: string;
    duration: number;
};

export type EndClassDeckSessionResponseDto = {
    success: boolean;
    data: ClassStudySession;
};
