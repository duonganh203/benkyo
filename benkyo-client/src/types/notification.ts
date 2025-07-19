export interface ClassNotification {
    id: string;
    description: string;
    type: 'invite' | 'system';
    message: string;
    classId?: string;
    className?: string;
    createdAt: string;
}
