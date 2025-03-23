export interface CreateCardRes {
    id: string;
    front: string;
    back: string;
    tags: string[];
    deckId: string;
}
export interface CardFormData {
    front: string;
    back: string;
    tags: string[];
    deckId: string;
}

export interface BatchImportCard {
    front: string;
    back: string;
    tags: string[];
}
