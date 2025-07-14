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
