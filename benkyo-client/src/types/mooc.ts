import { Types } from 'mongoose';

export interface MoocDeck {
    deck: string | { _id: string; title: string };
    order: number;
}

export interface DeckProgress {
    deck: string | { _id: string; title: string };
    completed: boolean;
    completedAt?: Date | string;
}

export interface EnrolledUser {
    user: string | { _id: string; name: string; email: string };
    currentDeckIndex: number;
    progressState: number;
    deckProgress: DeckProgress[];
    startedAt?: Date | string;
    completedAt?: Date | string;
}

export interface MoocInterface {
    _id: string | Types.ObjectId;
    title: string;
    description?: string;
    owner: string | { _id: string; name: string; email: string };
    class?: string | { _id: string; name: string };
    decks: MoocDeck[];
    enrolledUsers: EnrolledUser[];
    publicStatus: number;
    isPaid: boolean;
    price: number;
    currency: string;
    likes: number;
    views: number;
    createdAt: Date | string;
    updatedAt: Date | string;
}
