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
    _id: string;
    class: string;
    createdAt: string;
    createdBy: {
        name: string;
    };
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
    deck?: string;
}

export interface CreateQuizAIRes {
    quiz: {
        _id: string;
        class: string;
        createdAt: string;
        createdBy: {
            name: string;
        };
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
        deck?: string;
    };
}
