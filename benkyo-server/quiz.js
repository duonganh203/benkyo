db.createCollection('questions');

db.questions.insertMany([
    {
        text: 'What is the capital of France?',
        options: ['London', 'Paris', 'Berlin', 'Rome'],
        keywords: ['france', 'capital', 'geography'],
        correctAnswerIndex: 1
    },
    {
        text: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        keywords: ['math', 'addition', 'basic'],
        correctAnswerIndex: 1
    },
    {
        text: "Which planet is known as the 'Red Planet'?",
        options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
        keywords: ['planet', 'red planet', 'space'],
        correctAnswerIndex: 1
    },
    {
        text: 'What year did the Titanic sink?',
        options: ['1912', '1910', '1920', '1905'],
        keywords: ['Titanic', 'sinking', 'history'],
        correctAnswerIndex: 0
    },
    {
        text: "Who wrote 'Romeo and Juliet'?",
        options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
        keywords: ['Romeo and Juliet', 'Shakespeare', 'literature'],
        correctAnswerIndex: 1
    }
]);

// Quiz schema and data
db.createCollection('quizzes');

db.quizzes.insertMany([
    {
        title: 'General Knowledge Quiz',
        description: 'Test your general knowledge with these questions.',
        questions: ['q101', 'q102', 'q103']
    },
    {
        title: 'History and Literature Quiz',
        description: 'A quiz focusing on history and literature.',
        questions: ['q104', 'q105']
    }
]);
