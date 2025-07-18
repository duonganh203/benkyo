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
