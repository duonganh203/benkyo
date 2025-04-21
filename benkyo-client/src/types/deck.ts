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
}
export interface DeckInterface {
    _id: string;
    name: string;
    description: string;
    cardCount: number;
    updatedAt: string;
    createdAt: string;
    owner: Onwer;
    isPublic: boolean;
}

interface Onwer {
    name: string;
    avatar?: string;
}
