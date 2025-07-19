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

export type ClassVisitEntry = {
    userId: PopulatedUser | null;
    lastVisit: string;
};

export type ClassVisited = {
    count: number;
    history: ClassVisitEntry[];
};

export type JoinRequest = {
    _id: string;
    user: PopulatedUser;
    requestDate: Date;
};

type UserClassState = {
    _id: string;
    user: string;
    class: string;
    points: number;
    studyStreak: number;
    lastStudyDate?: Date;
    createdAt: Date;
    updatedAt: Date;
};

type UserClassStatePopulated = Omit<UserClassState, 'user'> & {
    user: PopulatedUser;
};

type Deck = {
    _id: string;
    name: string;
    description?: string;
    owner: string;
    cardCount: number;
};

export type ClassManagementResponseDto = {
    _id: string;
    name: string;
    description: string;
    bannerUrl: string;
    owner: PopulatedUser;
    visibility: 'public' | 'private';
    requiredApprovalToJoin: boolean;
    users: PopulatedUser[];
    joinRequests: JoinRequest[];
    visited: ClassVisited;
    desks: Deck[];
    userClassStates: UserClassStatePopulated[];
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
