export interface CreateDeckPayload {
    name: string;
    description?: string;
}
export interface CreateDeckRes {
    id: string;
}
export interface DeckDetails {
    _id: string;
    name: string;
    description?: string;
    publicStatus: number;
    owner: Owner;
    likeCount: number;
    liked?: boolean;
    fsrsParams?: {
        request_retention?: number;
        maximum_interval?: number;
        w?: number[];
        enable_fuzz?: boolean;
        enable_short_term?: boolean;
        card_limit?: number;
        lapses?: number;
    };
}
export interface DeckInterface {
    _id: string;
    name: string;
    description: string;
    cardCount: number;
    updatedAt: string;
    createdAt: string;
    owner: Owner;
    isPublic: boolean;
    likeCount: number;
    liked?: boolean;
    publicStatus?: number;
    reviewNote?: string;
    reviewedBy?: string;
}

interface Owner {
    _id: string;
    name: string;
    avatar?: string;
}
export interface UpdateDeckPayload {
    name?: string;
    description?: string;
}
