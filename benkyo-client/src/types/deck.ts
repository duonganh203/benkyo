import { User } from './auth';

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
}
export interface DeckInterface {
    _id: string;
    name: string;
    description: string;
    cardCount: number;
    updatedAt: string;
    createdAt: string;
    owner: User;
    isPublic: boolean;
}
