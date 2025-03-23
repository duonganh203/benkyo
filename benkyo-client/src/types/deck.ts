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
