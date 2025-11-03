import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, BookOpen, Zap } from 'lucide-react';
import { QuizCardClass } from '@/components/quiz-card-class';

import { AIQuizModal } from '@/components/modals/ai-create-quiz-modal';
import { CreateQuizModal } from '@/components/modals/create-quiz-modal';
import { useParams } from 'react-router-dom';
import useGetAllClassQuiz from '@/hooks/queries/use-get-class-quiz';

export interface Quiz {
    id: string;
    title: string;
    description?: string;
    classId: string;
    createdAt: Date;
    type: 'manual' | 'ai';
    mooc?: {
        _id: string;
        title: string;
    };
    deck?: {
        _id: string;
        name: string;
    };
    questions: Question[];
}

export interface Question {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
}

const ClassQuizManagement = () => {
    const { classId } = useParams<{ classId: string }>();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);

    const { data: fetchedQuizzes = [], isLoading, refetch } = useGetAllClassQuiz(classId || '');

    useEffect(() => {
        if (!Array.isArray(fetchedQuizzes)) return;

        const transformed = fetchedQuizzes.map(
            (quiz): Quiz => ({
                id: quiz._id ?? '',
                title: quiz.title ?? 'Untitled Quiz',
                description: quiz.description ?? '',
                classId: quiz.class ?? '',
                createdAt: new Date(quiz.createdAt),
                type: quiz.type ?? 'manual',
                mooc: quiz.mooc ? { _id: quiz.mooc._id, title: quiz.mooc.title } : undefined,
                deck: quiz.moocDeck ? { _id: quiz.moocDeck._id, name: quiz.moocDeck.name } : undefined,
                questions: (quiz.questions ?? []).map((q) => ({
                    id: q._id,
                    question: q.questionText,
                    options: q.choices,
                    correctAnswer: q.correctAnswer
                }))
            })
        );

        setQuizzes(transformed);
    }, [fetchedQuizzes]);

    const handleCreateQuiz = (quiz: Omit<Quiz, 'id' | 'createdAt'>) => {
        const newQuiz: Quiz = {
            ...quiz,
            id: Date.now().toString(),
            createdAt: new Date(),
            classId: classId || ''
        };
        setQuizzes((prev) => [...prev, newQuiz]);
        setShowCreateModal(false);
        refetch();
    };

    const handleEditQuiz = (updated: Quiz) => {
        setQuizzes((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
        refetch();
    };

    const handleDeleteQuiz = (quizId: string) => {
        setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
        refetch();
    };

    return (
        <div className='min-h-screen bg-background'>
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

            <div className='container mx-auto px-4 py-6'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
                    <Card className='bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-lg'>
                        <CardHeader className='pb-3'>
                            <CardTitle className='text-lg font-medium'>Total Quizzes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='text-3xl font-bold'>{quizzes.length}</div>
                        </CardContent>
                    </Card>
                    <Card className='bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg'>
                        <CardHeader className='pb-3'>
                            <CardTitle className='text-lg font-medium'>Manual Quizzes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='text-3xl font-bold'>
                                {quizzes.filter((q) => q.type === 'manual').length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className='bg-gradient-to-r from-purple-600 to-purple-400 text-white shadow-lg'>
                        <CardHeader className='pb-3'>
                            <CardTitle className='text-lg font-medium'>AI Generated</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='text-3xl font-bold'>{quizzes.filter((q) => q.type === 'ai').length}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className='mb-6'>
                    <h2 className='text-2xl font-bold mb-4 text-foreground'>Your Quizzes</h2>
                    {isLoading ? (
                        <p className='text-muted-foreground'>Loading quizzes...</p>
                    ) : quizzes.length === 0 ? (
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
                                <QuizCardClass
                                    key={quiz.id}
                                    quiz={quiz}
                                    onDelete={handleDeleteQuiz}
                                    onEdit={handleEditQuiz}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <CreateQuizModal
                open={showCreateModal}
                onOpenChange={setShowCreateModal}
                onSubmit={handleCreateQuiz}
                classId={classId || ''}
            />
            <AIQuizModal
                open={showAIModal}
                onOpenChange={setShowAIModal}
                onSubmit={handleCreateQuiz}
                classId={classId || ''}
            />
        </div>
    );
};

export default ClassQuizManagement;
