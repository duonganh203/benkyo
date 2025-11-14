export interface createQuizPayload {
    title?: string;
    description?: string;
    classId?: string;
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
    title?: string;
    description?: string;
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
    _id?: string;
    id?: string;
    class: string;
    createdAt: string;
    createdBy: { _id?: string; name: string; email?: string };
    mooc?: { _id: string; title: string };
    moocDeck?: { _id: string; name: string };
    questions: { _id: string; questionText: string; choices: string[]; correctAnswer: number; explanation?: string }[];
    title?: string;
    description?: string;
    type?: 'manual' | 'ai';
}

export interface CreateQuizAIRes {
    quiz: {
        _id: string;
        class: string;
        createdAt: string;
        createdBy?: { _id?: string; name?: string; email?: string };
        mooc?: { _id: string; title: string };
        moocDeck?: { _id: string; name: string }; // note name field
        questions: {
            _id: string;
            questionText: string;
            choices: string[];
            correctAnswer: number;
            explanation?: string;
        }[];
        title?: string;
        description?: string;
        type?: 'manual' | 'ai';
        deck?: string | { _id: string; name?: string };
    };
}

export interface MoocDeckQuizInterface {
    _id: string;
    classId: string;
    moocId: string;
    deckId: string;
    title: string;
    description?: string;
    type: string;
    questions: {
        questionText: string;
        options: string[];
        correctAnswer: string;
    }[];
    createdAt: string;
    updatedAt: string;
}

export interface QuizHubChoice {
    _id: string;
    text: string;
}

export interface QuizHubQuestion {
    _id: string;
    questionText: string;
    choices: QuizHubChoice[];
    correctAnswer: number;
}

export interface QuizHub {
    _id: string;
    title: string;
    description?: string;
    class: string;
    mooc: string;
    moocDeck: string;
    type: 'manual' | 'ai';
    questions: QuizHubQuestion[];
    createdAt: string;
}

export interface QuizResponse {
    questionId: string;
    selectedChoice: number;
}

export interface QuizAttempt {
    _id: string;
    user: string;
    quiz: string;
    totalQuestions: number;
    correctAnswers: number;
    responses: QuizResponse[];
    startTime: string;
    endTime: string;
}

export interface QuizAttemptResult {
    attempt: QuizAttempt;
    scorePercent: number;
}
