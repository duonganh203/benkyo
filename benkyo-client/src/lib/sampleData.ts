import { Class, Deck, Flashcard, MOOC } from '@/types/learning';

// Sample flashcards for different topics
const reactFlashcards: Flashcard[] = [
    {
        id: '1',
        front: 'What is JSX?',
        back: 'JSX is a syntax extension for JavaScript that allows you to write HTML-like code in your React components.'
    },
    {
        id: '2',
        front: 'What is a React component?',
        back: 'A React component is a reusable piece of UI that can accept props and return JSX elements.'
    },
    {
        id: '3',
        front: 'What is the useState hook?',
        back: 'useState is a React hook that allows you to add state to functional components.'
    },
    {
        id: '4',
        front: 'What is props drilling?',
        back: 'Props drilling is the process of passing data through many component layers to reach deeply nested components.'
    }
];

const jsFlashcards: Flashcard[] = [
    {
        id: '5',
        front: 'What is a closure in JavaScript?',
        back: 'A closure is a function that has access to variables in its outer scope even after the outer function has returned.'
    },
    {
        id: '6',
        front: 'What is the difference between let and var?',
        back: 'let has block scope and is not hoisted, while var has function scope and is hoisted.'
    },
    {
        id: '7',
        front: 'What is the Event Loop?',
        back: 'The Event Loop is what allows Node.js to perform non-blocking I/O operations by offloading operations to the system kernel.'
    }
];

const cssFlashcards: Flashcard[] = [
    {
        id: '8',
        front: 'What is Flexbox?',
        back: 'Flexbox is a CSS layout method that allows you to arrange items in a flexible container with control over direction, order, and alignment.'
    },
    {
        id: '9',
        front: 'What is the CSS Box Model?',
        back: 'The CSS Box Model describes how the rectangular boxes are generated for elements, consisting of content, padding, border, and margin.'
    }
];

// Sample decks
const sampleDecks: Deck[] = [
    {
        id: 'deck-1',
        title: 'React Fundamentals',
        description: 'Learn the core concepts of React including components, JSX, and hooks',
        flashcards: reactFlashcards,
        completed: false,
        unlocked: true,
        pointsRequired: 0,
        pointsEarned: 0
    },
    {
        id: 'deck-2',
        title: 'JavaScript Advanced Concepts',
        description: 'Deep dive into JavaScript closures, hoisting, and the event loop',
        flashcards: jsFlashcards,
        completed: false,
        unlocked: false,
        pointsRequired: 100
    },
    {
        id: 'deck-3',
        title: 'CSS Layout & Design',
        description: 'Master CSS Flexbox, Grid, and the Box Model',
        flashcards: cssFlashcards,
        completed: false,
        unlocked: false,
        pointsRequired: 200
    }
];

// Sample MOOCs
const sampleMOOCs: MOOC[] = [
    {
        id: 'mooc-1',
        title: 'Frontend Development Mastery',
        description: 'Complete guide to modern frontend development with React, JavaScript, and CSS',
        decks: sampleDecks,
        progress: 0
    },
    {
        id: 'mooc-2',
        title: 'Backend Development with Node.js',
        description: 'Learn server-side development, APIs, and databases',
        decks: [],
        progress: 0
    }
];

// Sample class
export const sampleClass: Class = {
    id: 'class-1',
    title: 'Full-Stack Web Development',
    description: 'Master both frontend and backend development to become a complete web developer',
    moocs: sampleMOOCs
};
