export interface createQuizPayload {
    deckId: string;
    questions: Question[];
}

export interface Question {
    questionText: string;
    choices: { text: string }[];
    correctAnswer: number;
}

export interface CreateQuizRes {
    id: string;
}
