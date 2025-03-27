export interface QuizAnswer {
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
}

export interface QuizResult {
    id: string;
    title: string;
    date: string;
    score: number;
    totalQuestions: number;
    timeTaken: string; // in format "MM:SS"
    answers: QuizAnswer[];
}

export const mockQuizResults: QuizResult[] = [
    {
        id: 'quiz-1',
        title: 'JavaScript Fundamentals',
        date: '2023-12-15T14:30:00',
        score: 8,
        totalQuestions: 10,
        timeTaken: '08:45',
        answers: [
            {
                question: 'What is JavaScript?',
                userAnswer: 'A programming language for web development',
                correctAnswer: 'A programming language for web development',
                isCorrect: true
            },
            {
                question: 'Which keyword is used to declare variables in JavaScript?',
                userAnswer: 'var, let, const',
                correctAnswer: 'var, let, const',
                isCorrect: true
            },
            {
                question: 'What does DOM stand for?',
                userAnswer: 'Document Object Model',
                correctAnswer: 'Document Object Model',
                isCorrect: true
            },
            {
                question: 'Is JavaScript case-sensitive?',
                userAnswer: 'Yes',
                correctAnswer: 'Yes',
                isCorrect: true
            },
            {
                question: "What will '2' + 2 evaluate to in JavaScript?",
                userAnswer: '4',
                correctAnswer: '22',
                isCorrect: false
            },
            {
                question: 'Which method adds an element at the end of an array?',
                userAnswer: 'push()',
                correctAnswer: 'push()',
                isCorrect: true
            },
            {
                question: 'What is the correct way to write a JavaScript array?',
                userAnswer: "var colors = ['red', 'green', 'blue']",
                correctAnswer: "var colors = ['red', 'green', 'blue']",
                isCorrect: true
            },
            {
                question: 'Which operator is used to assign a value to a variable?',
                userAnswer: '=',
                correctAnswer: '=',
                isCorrect: true
            },
            {
                question: 'How do you create a function in JavaScript?',
                userAnswer: 'function = myFunction()',
                correctAnswer: 'function myFunction()',
                isCorrect: false
            },
            {
                question: 'How do you round the number 7.25 to the nearest integer?',
                userAnswer: 'Math.round(7.25)',
                correctAnswer: 'Math.round(7.25)',
                isCorrect: true
            }
        ]
    },
    {
        id: 'quiz-2',
        title: 'React Basics',
        date: '2024-01-10T10:15:00',
        score: 7,
        totalQuestions: 10,
        timeTaken: '12:30',
        answers: [
            {
                question: 'What is React?',
                userAnswer: 'A JavaScript library for building user interfaces',
                correctAnswer: 'A JavaScript library for building user interfaces',
                isCorrect: true
            },
            {
                question: 'Who developed React?',
                userAnswer: 'Google',
                correctAnswer: 'Facebook',
                isCorrect: false
            },
            {
                question: 'What is JSX?',
                userAnswer: 'JavaScript XML',
                correctAnswer: 'JavaScript XML',
                isCorrect: true
            },
            {
                question: 'What is the virtual DOM in React?',
                userAnswer: 'A lightweight representation of the real DOM',
                correctAnswer: 'A lightweight representation of the real DOM',
                isCorrect: true
            },
            {
                question: 'How do you update state in React?',
                userAnswer: 'Using setState()',
                correctAnswer: 'Using setState()',
                isCorrect: true
            },
            {
                question: 'What are props in React?',
                userAnswer: 'Internal data storage',
                correctAnswer: 'Properties passed to components',
                isCorrect: false
            },
            {
                question: 'What is a React component?',
                userAnswer: 'Reusable piece of UI',
                correctAnswer: 'Reusable piece of UI',
                isCorrect: true
            },
            {
                question: 'What is the default port number for React development server?',
                userAnswer: '3000',
                correctAnswer: '3000',
                isCorrect: true
            },
            {
                question: 'Which method is called when a component is first rendered?',
                userAnswer: 'componentDidMount',
                correctAnswer: 'componentDidMount',
                isCorrect: true
            },
            {
                question: 'What tool is commonly used to create React applications?',
                userAnswer: 'React Builder',
                correctAnswer: 'Create React App',
                isCorrect: false
            }
        ]
    },
    {
        id: 'quiz-3',
        title: 'CSS Advanced Concepts',
        date: '2024-02-20T16:45:00',
        score: 9,
        totalQuestions: 10,
        timeTaken: '10:15',
        answers: [
            {
                question: 'What is CSS Grid?',
                userAnswer: 'A two-dimensional layout system',
                correctAnswer: 'A two-dimensional layout system',
                isCorrect: true
            },
            {
                question: 'What property is used for changing the text color?',
                userAnswer: 'color',
                correctAnswer: 'color',
                isCorrect: true
            },
            {
                question: 'What does CSS stand for?',
                userAnswer: 'Cascading Style Sheets',
                correctAnswer: 'Cascading Style Sheets',
                isCorrect: true
            },
            {
                question: 'Which CSS property controls the text size?',
                userAnswer: 'font-size',
                correctAnswer: 'font-size',
                isCorrect: true
            },
            {
                question: 'Which CSS property is used to control the spacing between elements?',
                userAnswer: 'margin',
                correctAnswer: 'margin',
                isCorrect: true
            },
            {
                question: 'What is the z-index property used for?',
                userAnswer: 'Controlling the position of elements',
                correctAnswer: 'Controlling the stacking order of elements',
                isCorrect: false
            },
            {
                question: 'What is a CSS preprocessor?',
                userAnswer: 'A program that extends CSS with variables and functions',
                correctAnswer: 'A program that extends CSS with variables and functions',
                isCorrect: true
            },
            {
                question: 'Which property is used to create rounded corners?',
                userAnswer: 'border-radius',
                correctAnswer: 'border-radius',
                isCorrect: true
            },
            {
                question: 'What is the box model in CSS?',
                userAnswer: 'A design concept for element spacing',
                correctAnswer: 'A design concept for element spacing',
                isCorrect: true
            },
            {
                question: 'Which CSS property is used for controlling the transparency of an element?',
                userAnswer: 'opacity',
                correctAnswer: 'opacity',
                isCorrect: true
            }
        ]
    }
];
