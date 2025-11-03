import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Zap, Trophy } from 'lucide-react';
import PointsDisplay from '@/components/point-display';
import { Skeleton } from '@/components/ui/skeleton';
import useGetQuizzesByDeck from '@/hooks/queries/use-get-quizzes-by-deck';
import type { QuizHub as QuizHubType } from '@/types/quiz'; // type-only import

const QuizHub: React.FC = () => {
    const { classId, moocId, deckId } = useParams<{ classId: string; moocId: string; deckId: string }>();
    const navigate = useNavigate();

    const { data, isLoading, isError } = useGetQuizzesByDeck(classId!, moocId!, deckId!);
    const quizzes: QuizHubType[] = data ?? [];
    const mainQuiz = quizzes[0];
    console.log('Quizzes fetched:', quizzes);

    const handleBackToMOOC = () => navigate(`/class/${classId}/mooc/${moocId}`);
    const handleStartQuiz = (quizId: string) =>
        navigate(`/class/${classId}/mooc/${moocId}/deck/${deckId}/quiz-hub/${quizId}`);

    if (isLoading)
        return (
            <div className='max-w-4xl mx-auto p-8 space-y-4'>
                <Skeleton className='h-8 w-1/3' />
                <Skeleton className='h-6 w-2/3' />
                <Skeleton className='h-40 w-full' />
            </div>
        );

    if (isError)
        return (
            <div className='text-center py-16'>
                <p className='text-lg text-muted-foreground'>❌ Failed to load quizzes.</p>
                <Button onClick={handleBackToMOOC} className='mt-4'>
                    Go Back
                </Button>
            </div>
        );

    return (
        <div className='min-h-screen bg-background'>
            {/* Header */}
            <header className='bg-card border-b border-border py-6 px-4'>
                <div className='max-w-4xl mx-auto'>
                    <Button variant='ghost' onClick={handleBackToMOOC} className='mb-4 flex items-center gap-2'>
                        <ArrowLeft className='w-4 h-4' />
                        Back to MOOC
                    </Button>

                    <div className='flex items-start gap-4'>
                        <div className='p-3 bg-primary/10 rounded-lg'>
                            <Zap className='w-8 h-8 text-primary' />
                        </div>
                        <div>
                            <h1 className='text-3xl font-bold text-foreground mb-2'>Quiz Hub</h1>
                            <p className='text-lg text-muted-foreground'>
                                Complete quizzes to earn points and unlock more decks!
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className='py-8 px-4'>
                <div className='max-w-4xl mx-auto space-y-8'>
                    {/* Points Display */}
                    <PointsDisplay
                        totalPoints={120}
                        pointsToNextUnlock={80}
                        nextUnlockTitle='Japanese N5 Grammar Deck'
                    />

                    {/* Main Test */}
                    {mainQuiz ? (
                        <Card className='shadow-elevated border-primary/20'>
                            <CardHeader>
                                <div className='flex items-center gap-3'>
                                    <div className='p-2 bg-primary/10 rounded-lg'>
                                        <Trophy className='w-6 h-6 text-primary' />
                                    </div>
                                    <div>
                                        <CardTitle className='text-xl'>{mainQuiz.title}</CardTitle>
                                        <p className='text-muted-foreground'>
                                            {mainQuiz.description || 'Take the main test for this deck'}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className='flex items-center justify-between'>
                                    <div className='text-sm text-muted-foreground'>
                                        <p>• {mainQuiz.questions?.length || 0} questions</p>
                                        <p>• 10 points per correct answer</p>
                                        <p>• Need 70% to pass</p>
                                    </div>
                                    <Button onClick={() => handleStartQuiz(mainQuiz._id)} size='lg'>
                                        Start Main Test
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <p className='text-muted-foreground text-center'>No quiz available for this deck yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizHub;
