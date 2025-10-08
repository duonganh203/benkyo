import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PointsDisplay from '@/components/point-display';

import { ArrowLeft, BookOpen, Zap } from 'lucide-react';

import { sampleClass } from '@/lib/sampleData';
import ProgressCard from '@/components/moocs-card';
import { useUserProgressUi } from '@/hooks/queries/use-get-user-progress-ui';

const MOOCDetail: React.FC = () => {
    const { classId, moocId } = useParams<{ classId: string; moocId: string }>();
    const navigate = useNavigate();
    const [unlockedDecks] = useState<string[]>(['deck-1']);
    const { progress } = useUserProgressUi();
    const userPoints = progress.totalPoints;

    const mooc = sampleClass.moocs.find((m) => m.id === moocId);

    if (!mooc) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <p className='text-lg text-muted-foreground'>MOOC not found</p>
            </div>
        );
    }

    const handleDeckClick = (deckId: string) => {
        navigate(`/class/${classId}/mooc/${moocId}/deck/${deckId}`);
    };

    const handleQuizHub = (deckId: string) => {
        navigate(`/class/${classId}/mooc/${moocId}/deck/${deckId}/quiz-hub`);
    };

    const handleBackToClass = () => {
        navigate('/');
    };

    const getDeckStatus = (deckId: string) => {
        if (unlockedDecks.includes(deckId)) {
            return 'available';
        }
        // Check if user has enough points to unlock this deck
        const deck = mooc.decks.find((d) => d.id === deckId);
        if (deck && userPoints >= deck.pointsRequired) {
            return 'available';
        }
        return 'locked';
    };

    return (
        <div className='min-h-screen bg-background'>
            {/* Header */}
            <header className='bg-card border-b border-border py-6 px-4'>
                <div className='max-w-4xl mx-auto'>
                    <Button variant='ghost' onClick={handleBackToClass} className='mb-4 flex items-center gap-2'>
                        <ArrowLeft className='w-4 h-4' />
                        Back to Class Overview
                    </Button>

                    <div className='flex items-start gap-4'>
                        <div className='p-3 bg-primary/10 rounded-lg'>
                            <BookOpen className='w-8 h-8 text-primary' />
                        </div>
                        <div>
                            <h1 className='text-3xl font-bold text-foreground mb-2'>{mooc.title}</h1>
                            <p className='text-lg text-muted-foreground'>{mooc.description}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Points & Progress Overview */}
            <section className='py-8 px-4'>
                <div className='max-w-4xl mx-auto space-y-6'>
                    <PointsDisplay
                        totalPoints={userPoints}
                        pointsToNextUnlock={
                            mooc.decks.find((d) => !unlockedDecks.includes(d.id) && userPoints < d.pointsRequired)
                                ? mooc.decks.find(
                                      (d) => !unlockedDecks.includes(d.id) && userPoints < d.pointsRequired
                                  )!.pointsRequired - userPoints
                                : undefined
                        }
                        nextUnlockTitle={
                            mooc.decks.find((d) => !unlockedDecks.includes(d.id) && userPoints < d.pointsRequired)
                                ?.title
                        }
                    />

                    <Card className='shadow-card'>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <BookOpen className='w-5 h-5' />
                                Learning Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='space-y-4'>
                                <div className='flex justify-between text-sm'>
                                    <span>Overall Progress</span>
                                    <span>{Math.round(mooc.progress)}%</span>
                                </div>
                                <div className='w-full bg-muted rounded-full h-3'>
                                    <div
                                        className='gradient-primary h-3 rounded-full transition-all duration-500'
                                        style={{ width: `${mooc.progress}%` }}
                                    />
                                </div>
                                <p className='text-sm text-muted-foreground'>
                                    Complete each deck and pass the test to unlock the next level!
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Decks Section */}
            <section className='py-8 px-4'>
                <div className='max-w-4xl mx-auto'>
                    <div className='mb-8'>
                        <h2 className='text-2xl font-bold text-foreground mb-2'>Learning Decks</h2>
                        <p className='text-muted-foreground'>
                            Master each deck through flashcard practice, then take a test to proceed
                        </p>
                    </div>

                    <div className='grid grid-cols-1 gap-6'>
                        {mooc.decks.map((deck) => {
                            const deckStatus = getDeckStatus(deck.id);
                            const isAvailable = deckStatus === 'available';

                            return (
                                <div key={deck.id} className='space-y-3'>
                                    <ProgressCard
                                        title={deck.title}
                                        description={`${deck.description} • ${deck.flashcards.length} flashcards • ${deck.pointsRequired} points required`}
                                        progress={deck.completed ? 100 : 0}
                                        status={deckStatus}
                                        onClick={() => isAvailable && handleDeckClick(deck.id)}
                                        testScore={deck.testScore}
                                    />

                                    {isAvailable && (
                                        <div className='flex justify-end'>
                                            <Button
                                                variant='outline'
                                                size='sm'
                                                onClick={() => handleQuizHub(deck.id)}
                                                className='flex items-center gap-2'
                                            >
                                                <Zap className='w-4 h-4' />
                                                Bonus Challenges
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {mooc.decks.length === 0 && (
                        <Card className='shadow-card'>
                            <CardContent className='p-8 text-center'>
                                <BookOpen className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
                                <h3 className='text-lg font-semibold text-foreground mb-2'>Coming Soon</h3>
                                <p className='text-muted-foreground'>
                                    Decks for this MOOC are being prepared. Check back soon!
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </section>
        </div>
    );
};

export default MOOCDetail;
