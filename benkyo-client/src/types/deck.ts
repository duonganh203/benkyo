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
}

interface Owner {
    _id: string;
    name: string;
    avatar?: string;
}
