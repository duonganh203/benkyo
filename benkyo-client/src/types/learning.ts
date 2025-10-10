export interface Flashcard {
    id: string;
    front: string;
    back: string;
}

export interface Deck {
    id: string;
    title: string;
    description: string;
    flashcards: Flashcard[];
    completed: boolean;
    unlocked: boolean;
    testScore?: number;
    pointsRequired: number;
    pointsEarned?: number;
}

export interface MOOC {
    id: string;
    title: string;
    description: string;
    decks: Deck[];
    progress: number; // percentage of completed decks
}

export interface Class {
    id: string;
    title: string;
    description: string;
    moocs: MOOC[];
}

export interface UserProgress {
    currentClass: string;
    currentMooc: string;
    currentDeck?: string;
    completedDecks: string[];
    testScores: Record<string, number>;
    totalPoints: number;
    deckPoints: Record<string, number>;
}

export interface TestQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    flashcardId: string;
    type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'matching';
    points: number;
}

export interface QuizChallenge {
    id: string;
    title: string;
    description: string;
    type: 'speed-round' | 'memory-challenge' | 'bonus-quiz';
    questions: TestQuestion[];
    timeLimit?: number;
    pointsMultiplier: number;
}
