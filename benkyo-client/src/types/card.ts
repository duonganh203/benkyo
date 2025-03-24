export interface CreateCardRes {
    id: string;
    front: string;
    back: string;
    tags: string[];
    deckId: string;
}

export interface updateCardRes {
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
export interface CardInterface {
    _id: string;
    deck: string;
    front: string;
    back: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    media: CardMedia[];
    learning: CardLearning;
}
export interface CardMedia {
    type: 'image' | 'audio' | 'video';
    url: string;
    filename?: string;
}

export interface CardLearning {
    state: State;
    due: string;
    elapsed_days: number;
    stability: number;
    difficulty: number;
}

export interface StudyStats {
    studied: number;
    total: number;
    started: Date;
}
export enum State {
    NEW = 0,
    LEARNING = 1,
    REVIEW = 2,
    RELEARNING = 3
}
export enum Rating {
    AGAIN = 1,
    HARD = 2,
    GOOD = 3,
    EASY = 4
}
