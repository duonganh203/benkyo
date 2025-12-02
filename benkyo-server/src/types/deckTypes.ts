import { Types } from 'mongoose';

export type PublicDeckRequestNotificationType = {
    notificationType: 'public_deck_request';
    sortTime: Date;
    priority: number;
    id: string;
    actorId: string;
    actorName: string;
    actorAvatar?: string;
    deckId: string;
    deckTitle: string;
    message: string;
    isRead: boolean;
};
