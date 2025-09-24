export interface ClassNotification {
    id: string;
    description: string;
    type: 'invite' | 'system' | 'join_request';
    message: string;
    classId?: string;
    className?: string;
    createdAt: string | Date;

    requestUserId?: string;
    requestUserName?: string;
    requestUserEmail?: string;
    requestUserAvatar?: string;
}
