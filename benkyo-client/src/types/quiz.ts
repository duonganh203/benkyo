export interface createQuizPayload {
    deckId: string;
    questions: Question[];
}

export interface Question {
    questionText: string;
    choices: { text: string }[];
    correctAnswer: number;
}

export interface QuizRes {
    _id: string;
    deck: {
        _id: string;
        name: string;
    };
    createdBy: string;
    createdAt: string;
    questions: Question[];
}

export interface QuizAttemptPayload {
    quizId: string;
    startTime: string;
    endTime: string;
    totalQuestions: number;
    correctAnswers: number;
    responses: Response[];
}

export interface QuizAttemptRes {
    quiz: {
        _id: string;
        deck: {
            _id: string;
            name: string;
        };
        questions: Question[];
    };
    startTime: string;
    endTime: string;
    totalQuestions: number;
    correctAnswers: number;
    responses: Response[];
}

export interface QuizAttemptRes {
    id: string;
}

export interface QuizAllAttemptRes {
    _id: string;
    quiz: {
        _id: string;
        deck: {
            _id: string;
            name: string;
        };
        questions: Question[];
    };
    startTime: string;
    endTime: string;
    totalQuestions: number;
    correctAnswers: number;
    responses: Response[];
}

export interface Response {
    questionIndex: number;
    selectedChoice: number;
}

export interface CreateQuizRes {
    id: string;
}
