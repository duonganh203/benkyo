import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, BookOpen, Zap } from 'lucide-react';
import { QuizCardClass } from '@/components/quiz-card-class';

import { AIQuizModal } from '@/components/modals/ai-create-quiz-modal';
import { CreateQuizModal } from '@/components/modals/create-quiz-modal';

export interface Quiz {
    id: string;
    title: string;
    description: string;
    questions: Question[];
    createdAt: Date;
    type: 'manual' | 'ai';
    deck?: string;
}

export interface Question {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
}

const ClassQuizManagement = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([
        {
            id: '1',
            title: 'Math Fundamentals',
            description: 'Basic arithmetic and algebra concepts',
            questions: [
                {
                    id: '1',
                    question: 'What is 2 + 2?',
                    options: ['3', '4', '5', '6'],
                    correctAnswer: 1,
                    explanation: '2 + 2 equals 4'
                }
            ],
            createdAt: new Date(),
            type: 'manual'
        },
        {
            id: '2',
            title: 'Science Basics',
            description: 'Introduction to scientific concepts',
            questions: [
                {
                    id: '1',
                    question: 'What is H2O?',
                    options: ['Oxygen', 'Water', 'Hydrogen', 'Carbon'],
                    correctAnswer: 1,
                    explanation: 'H2O is the chemical formula for water'
                }
            ],
            createdAt: new Date(),
            type: 'ai',
            deck: 'Science Fundamentals'
        }
    ]);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);

    const handleCreateQuiz = (quiz: Omit<Quiz, 'id' | 'createdAt'>) => {
        const newQuiz: Quiz = {
            ...quiz,
            id: Date.now().toString(),
            createdAt: new Date()
        };
        setQuizzes([...quizzes, newQuiz]);
        setShowCreateModal(false);
    };

    const handleDeleteQuiz = (quizId: string) => {
        setQuizzes(quizzes.filter((q) => q.id !== quizId));
    };

    return (
        <div className='min-h-screen bg-background'>
            {/* Header */}
            <div className='bg-background border-b border-border'>
                <div className='container mx-auto px-4 py-6'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <h1 className='text-3xl font-bold text-foreground'>My Class</h1>
                            <p className='text-muted-foreground mt-1'>Create and manage your quizzes</p>
                        </div>
                        <div className='flex gap-3'>
                            <Button
                                onClick={() => setShowCreateModal(true)}
                                className='bg-primary hover:bg-primary/90 text-primary-foreground'
                            >
                                <Plus className='w-4 h-4 mr-2' />
                                Create Quiz
                            </Button>
                            <Button
                                onClick={() => setShowAIModal(true)}
                                variant='secondary'
                                className='bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                            >
                                <Zap className='w-4 h-4 mr-2' />
                                AI Quiz Generator
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className='container mx-auto px-4 py-6'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
                    <Card className='bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-800 dark:to-blue-600 text-white shadow-lg'>
                        <CardHeader className='pb-3'>
                            <CardTitle className='text-lg font-medium'>Total Quizzes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='text-3xl font-bold'>{quizzes.length}</div>
                        </CardContent>
                    </Card>

                    <Card className='bg-gradient-to-r from-green-600 to-green-500 dark:from-green-800 dark:to-green-600 text-white shadow-lg'>
                        <CardHeader className='pb-3'>
                            <CardTitle className='text-lg font-medium'>Manual Quizzes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='text-3xl font-bold'>
                                {quizzes.filter((q) => q.type === 'manual').length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className='bg-gradient-to-r from-purple-600 to-purple-400 dark:from-purple-800 dark:to-purple-600 text-white shadow-lg'>
                        <CardHeader className='pb-3'>
                            <CardTitle className='text-lg font-medium'>AI Generated</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='text-3xl font-bold'>{quizzes.filter((q) => q.type === 'ai').length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quizzes Grid */}
                <div className='mb-6'>
                    <h2 className='text-2xl font-bold mb-4 text-foreground'>Your Quizzes</h2>
                    {quizzes.length === 0 ? (
                        <Card className='p-12 text-center bg-card'>
                            <BookOpen className='w-16 h-16 mx-auto text-muted-foreground mb-4' />
                            <h3 className='text-xl font-semibold mb-2 text-foreground'>No quizzes yet</h3>
                            <p className='text-muted-foreground mb-6'>Create your first quiz to get started</p>
                            <div className='flex gap-3 justify-center'>
                                <Button
                                    onClick={() => setShowCreateModal(true)}
                                    className='bg-primary hover:bg-primary/90 text-primary-foreground'
                                >
                                    <Plus className='w-4 h-4 mr-2' />
                                    Create Quiz
                                </Button>
                                <Button
                                    onClick={() => setShowAIModal(true)}
                                    variant='secondary'
                                    className='bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                                >
                                    <Zap className='w-4 h-4 mr-2' />
                                    Use AI Generator
                                </Button>
                            </div>
                        </Card>
                    ) : (
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                            {quizzes.map((quiz) => (
                                <QuizCardClass key={quiz.id} quiz={quiz} onDelete={handleDeleteQuiz} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <CreateQuizModal open={showCreateModal} onOpenChange={setShowCreateModal} onSubmit={handleCreateQuiz} />

            <AIQuizModal open={showAIModal} onOpenChange={setShowAIModal} onSubmit={handleCreateQuiz} />
        </div>
    );
};

export default ClassQuizManagement;
