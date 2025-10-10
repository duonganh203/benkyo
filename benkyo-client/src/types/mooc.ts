export interface MoocDeck {
    deck: string | { _id: string; title: string; name?: string; description?: string; cardCount?: number };
    order: number;
    pointsRequired?: number;
}

export interface DeckProgress {
    deck: string | { _id: string; title: string };
    completed: boolean;
    completedAt?: Date | string;
}
export interface AllMoocsResponse {
    success: boolean;
    message: string;
    data: MoocInterface[];
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
    _id: string;
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

export enum PublicStatus {
    PRIVATE = 0,
    PUBLIC = 2
}

export interface CreateMoocPayload {
    title: string;
    description?: string;
    decks?: {
        name: string;
        description?: string;
        order: number;
        cards?: {
            front: string;
            back: string;
            tags?: string[];
        }[];
    }[];
    isPaid?: boolean;
    price?: number;
    currency?: string;
    publicStatus?: PublicStatus;
}

export interface UpdateMoocPayload {
    title?: string;
    description?: string;
    decks?: string[];
    publicStatus?: number;
    isPaid?: boolean;
    price?: number;
    currency?: string;
}

export interface EnrollPayload {
    userId: string;
    moocId: string;
}

export interface UpdateProgressPayload {
    moocId: string;
    deckId: string;
    completed: boolean;
}
