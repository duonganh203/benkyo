export interface CreateDeckPayload {
    name: string;
    description?: string;
}
export interface Deck {
    _id: string;
    userId: string;
    name: string;
    description?: string;
    isPublic: boolean;
    cardCount: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
}
