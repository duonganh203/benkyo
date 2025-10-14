import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, BookOpen, Target } from 'lucide-react';
import FlashcardViewer from '@/components/flashcard-viewer';
import useGetDeckCards from '@/hooks/queries/use-get-deck-cards';
import useMe from '@/hooks/queries/use-me';
import { useGetMoocDetail } from '@/hooks/queries/use-get-mooc-detail';
import { getToast } from '@/utils/getToast';

const DeckStudy: React.FC = () => {
    type TempDeck = {
        _id: string;
        name: string;
        description?: string;
        cardCount?: number;
    };

    type TempMooc = {
        _id: string;
        title: string;
        owner?: { _id: string };
        publicStatus?: number;
        decks?: { deck: TempDeck }[];
    };

    const { classId, deckId, moocId } = useParams<{
        classId: string;
        deckId: string;
        moocId: string;
    }>();

    const navigate = useNavigate();
    const { data: user } = useMe();
    const { data: mooc, isLoading: isMoocLoading } = useGetMoocDetail(moocId!) as {
        data?: TempMooc;
        isLoading: boolean;
    };
    const { data: cardsData, isLoading: isCardsLoading } = useGetDeckCards(deckId ?? '');
    const totalCards = Array.isArray(cardsData) ? cardsData.length : 0;
    const currentDeck = mooc?.decks?.map((d) => d.deck)?.find((deck) => String(deck._id) === String(deckId));
    const deckTitle = currentDeck?.name || 'Deck Title';
    const storageKey = `deck-${deckId}-currentIndex`;
    const [currentCardIndex, setCurrentCardIndex] = useState(() => {
        const saved = sessionStorage.getItem(storageKey);
        return saved ? Number(saved) : 0;
    });
    const [studyCompleted, setStudyCompleted] = useState(false);

    useEffect(() => {
        setCurrentCardIndex(0);
        setStudyCompleted(false);
        sessionStorage.removeItem(storageKey);
    }, [deckId]);

    useEffect(() => {
        sessionStorage.setItem(storageKey, String(currentCardIndex));
    }, [currentCardIndex]);

    if (!deckId || !classId || !moocId) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <p className='text-lg text-muted-foreground'>Invalid URL</p>
            </div>
        );
    }

    if (isMoocLoading || isCardsLoading) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <p className='text-lg text-muted-foreground'>Loading...</p>
            </div>
        );
    }

    const isOwner = user?._id === mooc?.owner?._id;
    const canAccess = isOwner || mooc?.publicStatus === 2;

    if (!canAccess) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <p className='text-lg text-muted-foreground'>You do not have permission to access this MOOC.</p>
            </div>
        );
    }

    const handleBack = () => navigate(-1);
    const handleTakeTest = () => navigate(`/test/${deckId}`);

    const handleFinishStudy = () => {
        if (currentCardIndex === totalCards - 1) {
            setStudyCompleted(true);
            getToast('success', 'You have completed this deck!');
        } else {
            getToast('error', 'Please review all flashcards before finishing!');
        }
    };

    const handleRestart = () => {
        setCurrentCardIndex(0);
        setStudyCompleted(false);
    };
    if (totalCards === 0) {
        return (
            <div className='min-h-screen bg-background flex flex-col'>
                {/* Header */}
                <header>
                    <div className='max-w-4xl mx-auto flex justify-between items-center py-4 px-4'>
                        <Button variant='outline' onClick={handleBack} className='flex items-center gap-2'>
                            <ChevronLeft className='h-5 w-5' /> Back
                        </Button>

                        <div className='text-center flex-1'>
                            <h1 className='text-xl font-semibold text-foreground'>{deckTitle}</h1>
                            <p className='text-sm text-muted-foreground'>Study Mode</p>
                        </div>
                        <div className='w-[70px]' />
                    </div>
                </header>

                {/* Main content */}
                <main className='flex-1 flex items-center justify-center px-4'>
                    <Card className='max-w-md w-full text-center shadow-lg border bg-card p-6'>
                        <CardContent>
                            <BookOpen className='w-16 h-16 text-muted-foreground mx-auto mb-4' />
                            <h2 className='text-2xl font-semibold text-foreground mb-2'>{deckTitle}</h2>
                            <p className='text-lg text-muted-foreground'>
                                There are no flashcards available in this deck yet.
                            </p>
                            <p className='text-sm text-muted-foreground mt-2'>
                                Please check back later or ask the MOOC owner to add some cards.
                            </p>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

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
                            You studied <strong>{totalCards}</strong> out of {totalCards} flashcards.
                        </p>
                        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                            <Button variant='outline' onClick={handleRestart}>
                                Review Again
                            </Button>
                            <Button variant='outline' onClick={handleTakeTest} className='flex items-center gap-2'>
                                <Target className='w-4 h-4' /> Take the Test
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
    return (
        <div className='min-h-screen bg-background'>
            <header>
                <div className='max-w-4xl mx-auto flex justify-between items-center py-4 px-4'>
                    <Button variant='outline' onClick={handleBack} className='flex items-center gap-2'>
                        <ChevronLeft className='h-5 w-5' /> Back
                    </Button>

                    <div className='text-center flex-1'>
                        <h1 className='text-xl font-semibold text-foreground'>{deckTitle}</h1>
                        <p className='text-sm text-muted-foreground'>Study Mode</p>
                    </div>

                    <div className='w-20' />
                </div>
            </header>

            <main className='py-12 px-4 flex flex-col items-center gap-6'>
                <div className='w-full max-w-2xl'>
                    <FlashcardViewer
                        cards={Array.isArray(cardsData) ? cardsData : []}
                        initialIndex={currentCardIndex}
                        onCardChange={setCurrentCardIndex}
                    />
                </div>

                <Button
                    onClick={handleFinishStudy}
                    className='mt-6 px-8 py-3 rounded-full text-lg font-semibold text-white 
          bg-gradient-to-r from-green-500 to-emerald-600 
          hover:from-green-600 hover:to-emerald-700 
          transition-all duration-300 shadow-lg hover:shadow-xl 
          flex items-center gap-2'
                >
                    <Target className='w-5 h-5' /> Finish Study
                </Button>
            </main>

            <section className='pb-16 px-4'>
                <div className='max-w-2xl mx-auto'>
                    <Card className='shadow-md bg-accent/40 border'>
                        <CardContent className='p-6'>
                            <div className='flex items-start gap-3'>
                                <BookOpen className='w-5 h-5 text-primary mt-1' />
                                <div>
                                    <h3 className='font-semibold text-foreground mb-2'>Study Tips</h3>
                                    <ul className='text-sm text-muted-foreground space-y-1'>
                                        <li>• Try to answer before flipping the card.</li>
                                        <li>• Review difficult cards multiple times.</li>
                                        <li>• Take your time to understand each concept.</li>
                                        <li>• Complete all cards to unlock the test.</li>
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
