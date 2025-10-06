import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Target } from 'lucide-react';
import { sampleClass } from '@/lib/sampleData';
import FlashcardViewer from '@/components/flashcard-viewer';

const DeckStudy: React.FC = () => {
    const { classId, deckId } = useParams<{ classId: string; deckId: string }>();
    const navigate = useNavigate();
    const [studyCompleted, setStudyCompleted] = useState(false);

    // Find deck
    let deck;
    let moocId: string;
    for (const mooc of sampleClass.moocs) {
        const foundDeck = mooc.decks.find((d) => d.id === deckId);
        if (foundDeck) {
            deck = foundDeck;
            moocId = mooc.id;
            break;
        }
    }

    if (!deck) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <p className='text-lg text-muted-foreground'>Deck not found</p>
            </div>
        );
    }

    const handleBackToMOOC = () => navigate(`/class/${classId}/mooc/${moocId}`);
    const handleTakeTest = () => navigate(`/test/${deckId}`);
    const handleRestart = () => setStudyCompleted(false);

    if (studyCompleted) {
        return (
            <div className='min-h-screen bg-background flex items-center justify-center px-4'>
                <Card className='max-w-2xl w-full shadow-lg'>
                    <CardContent className='p-8 text-center'>
                        <div className='p-4 bg-green-100 rounded-full w-fit mx-auto mb-6'>
                            <Target className='w-12 h-12 text-green-600' />
                        </div>

                        <h2 className='text-2xl font-bold text-foreground mb-4'>Deck Study Complete!</h2>

                        <p className='text-lg text-muted-foreground mb-8'>
                            Great job studying <strong>{deck.title}</strong>! You reviewed all {deck.flashcards.length}{' '}
                            flashcards.
                        </p>

                        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                            <Button variant='outline' onClick={handleRestart}>
                                Review Again
                            </Button>
                            <Button variant='outline' onClick={handleTakeTest} className='flex items-center gap-2'>
                                <Target className='w-4 h-4' />
                                Take the Test
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-background'>
            {/* Header */}
            <header className='bg-card border-b border-border py-4 px-4 shadow-sm'>
                <div className='max-w-4xl mx-auto flex items-center justify-between'>
                    <Button variant='ghost' onClick={handleBackToMOOC} className='flex items-center gap-2'>
                        <ArrowLeft className='w-4 h-4' />
                        Back to MOOC
                    </Button>
                    <div className='text-center'>
                        <h1 className='text-xl font-semibold text-foreground'>{deck.title}</h1>
                        <p className='text-sm text-muted-foreground'>Study Mode</p>
                    </div>
                    <div className='w-20' /> {/* Spacer for alignment */}
                </div>
            </header>

            {/* Study Area */}
            <main className='py-12 px-4 flex flex-col items-center gap-6'>
                <div className='w-full max-w-2xl'>
                    <FlashcardViewer
                        cards={
                            Array.isArray(deck.flashcards)
                                ? deck.flashcards.map((flashcard: any) => ({
                                      _id: flashcard._id ?? '',
                                      deck: flashcard.deck ?? '',
                                      tags: flashcard.tags ?? [],
                                      createdAt: flashcard.createdAt ?? '',
                                      updatedAt: flashcard.updatedAt ?? '',
                                      question: flashcard.question,
                                      answer: flashcard.answer,
                                      ...flashcard
                                  }))
                                : []
                        }
                        initialIndex={0}
                    />
                </div>

                <Button
                    onClick={() => setStudyCompleted(true)}
                    className='mt-6 px-8 py-3 rounded-full text-lg font-semibold text-white 
               bg-gradient-to-r from-green-500 to-emerald-600 
               hover:from-green-600 hover:to-emerald-700 
               transition-all duration-300 shadow-lg hover:shadow-xl 
               flex items-center gap-2'
                >
                    <Target className='w-5 h-5' />
                    Finish Study
                </Button>
            </main>

            {/* Study Tips */}
            <section className='pb-16 px-4'>
                <div className='max-w-2xl mx-auto'>
                    <Card className='shadow-md bg-accent/40 border'>
                        <CardContent className='p-6'>
                            <div className='flex items-start gap-3'>
                                <BookOpen className='w-5 h-5 text-primary mt-1' />
                                <div>
                                    <h3 className='font-semibold text-foreground mb-2'>Study Tips</h3>
                                    <ul className='text-sm text-muted-foreground space-y-1'>
                                        <li>• Try to answer before flipping the card</li>
                                        <li>• Review difficult cards multiple times</li>
                                        <li>• Take your time to understand each concept</li>
                                        <li>• Complete all cards to unlock the test</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
};

export default DeckStudy;
