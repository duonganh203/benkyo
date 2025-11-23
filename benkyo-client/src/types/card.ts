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
    sourceText?: string;
    pageNumber?: number;
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

export interface RevlogEntry {
    _id: string;
    grade: number; // 1=Again, 2=Hard, 3=Good, 4=Easy
    state: number; // 0=New, 1=Learning, 2=Review, 3=Relearning
    due: string;
    stability: number;
    difficulty: number;
    elapsed_days: number;
    last_elapsed_days: number;
    scheduled_days: number;
    review: string;
    duration: number;
    created_at: string;
}

export interface LearningState {
    state: number;
    due: string;
    stability: number;
    difficulty: number;
    elapsed_days: number;
    scheduled_days: number;
}

export interface CardMetrics {
    totalReviews: number;
    averageRating: number;
    successRate: number;
    ratingCounts: {
        again: number;
        hard: number;
        good: number;
        easy: number;
    };
}

export interface CardDetailsResponse {
    card: {
        _id: string;
        front: string;
        back: string;
        tags: string[];
        createdAt: string;
        updatedAt: string;
        media: Array<{
            type: 'image' | 'audio' | 'video';
            url: string;
            filename: string;
        }>;
        deck: {
            _id: string;
            name: string;
            description: string;
        };
    };
    learningState: LearningState;
    retrievability: number | null;
    revlogs: RevlogEntry[];
    metrics: CardMetrics;
}
