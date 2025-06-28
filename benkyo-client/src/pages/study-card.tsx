import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ArrowRight, Check, X, Clock, BarChart, PenIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { CardInterface, Rating, StudyStats } from '@/types/card';
import useGetDueCards from '@/hooks/queries/use-get-due-cards';
import useSubmitReview from '@/hooks/queries/use-submit-review';
import { getToast } from '@/utils/getToast';
import useSkipCard from '@/hooks/queries/use-skip-card';
import { studyStreak } from '@/api/streakApi';
import { useStudyFlagStore } from '@/hooks/stores/use-study-store';

const StudyCard = () => {
    const { id: deckId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [showAnswer, setShowAnswer] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [studyComplete, setStudyComplete] = useState(false);
    const [cards, setCards] = useState<CardInterface[]>([]);
    const [stats, setStats] = useState<StudyStats>({
        studied: 0,
        total: 0,
        started: new Date()
    });
    const [exitDialog, setExitDialog] = useState(false);
    const [currentCardTime, setCurrentCardTime] = useState(0);

    const timerRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(Date.now());
    const streakLoggedRef = useRef(false);

    const { data: dueCards = [], isLoading } = useGetDueCards(deckId!);

    const { mutate: submitReview } = useSubmitReview(deckId!);

    const logStreakOnce = async () => {
        if (streakLoggedRef.current) return;
        streakLoggedRef.current = true;
        try {
            const data = await studyStreak();
            setJustStudied(true, data.studyStreak);
        } catch (err) {
            console.error('[STREAK] update failed', err);
            setJustStudied(true, null);
        }
    };

    useEffect(() => {
        return () => {
            streakLoggedRef.current = false;
        };
    }, [deckId]);

    useEffect(() => {
        setCards(dueCards);
        setStats((prev) => ({ ...prev, total: dueCards.length }));
    }, [dueCards]);

    useEffect(() => {
        startTimeRef.current = Date.now();

        const interval = setInterval(() => {
            setCurrentCardTime(Math.round((Date.now() - startTimeRef.current) / 1000));
        }, 1000);

        timerRef.current = interval as unknown as number;

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    useEffect(() => {
        startTimeRef.current = Date.now();
        setCurrentCardTime(0);
    }, [currentCardIndex]);

    const { setJustStudied } = useStudyFlagStore();

    const handleRate = (rating: Rating) => {
        if (!cards.length || currentCardIndex >= cards.length) return;
        const currentCard = cards[currentCardIndex];
        const reviewTime = Math.round((Date.now() - startTimeRef.current) / 1000);

        submitReview(
            { cardId: currentCard._id, rating, reviewTime },
            {
                onSuccess: async () => {
                    await logStreakOnce(); // <- ghi streak ngay lượt rate đầu tiên
                    setStats((prev) => ({ ...prev, studied: prev.studied + 1 }));
                    nextCard();
                },
                onError: () => getToast('error', 'Failed to submit rating')
            }
        );
    };

    const { mutate: skipCard } = useSkipCard(deckId!);

    const nextCard = () => {
        const nextIndex = currentCardIndex + 1;
        if (nextIndex >= cards.length) {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            setStudyComplete(true);
        } else {
            setCurrentCardIndex(nextIndex);
            setShowAnswer(false);
        }
    };

    const handleShowAnswer = async () => {
        await logStreakOnce();
        setShowAnswer(true);
    };

    const formatTime = (seconds: number): string => {
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    const handleExit = () => {
        setExitDialog(true);
    };

    const handleSkip = () => {
        if (!cards.length || currentCardIndex >= cards.length) return;
        const currentCard = cards[currentCardIndex];
        skipCard(
            { cardId: currentCard._id },
            {
                onSuccess: async () => {
                    await logStreakOnce(); // <- skip cũng log
                    nextCard();
                },
                onError: () => getToast('error', 'Failed to skip card')
            }
        );
    };

    const endStudySession = async () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        await logStreakOnce();
        navigate(`/deck/${deckId}`);
    };
    if (isLoading || !cards.length) {
        return (
            <div className='max-w-2xl mx-auto py-8 px-4'>
                <div className='flex items-center justify-between mb-6'>
                    <Button variant='ghost' onClick={() => navigate(-1)}>
                        <ChevronLeft className='h-4 w-4 mr-2' />
                        <span>Back</span>
                    </Button>
                    <h1 className='text-xl font-bold'>Study</h1>
                    <div className='w-14'></div>
                </div>

                <Card className='p-6 mt-4'>
                    <div className='text-center py-12'>
                        {isLoading ? (
                            <>
                                <div className='h-12 w-12 border-4 border-t-primary rounded-full animate-spin mx-auto mb-4'></div>
                                <p>Loading cards...</p>
                            </>
                        ) : (
                            <>
                                <BarChart className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
                                <h3 className='text-lg font-medium mb-2'>No cards to study</h3>
                                <p className='text-muted-foreground mb-6'>
                                    You're all caught up! Check back later for more cards.
                                </p>
                                <Button onClick={() => navigate(-1)}>Return to Deck</Button>
                            </>
                        )}
                    </div>
                </Card>
            </div>
        );
    }

    if (studyComplete) {
        const totalTime = Math.round((Date.now() - stats.started.getTime()) / 1000);

        return (
            <div className='max-w-2xl mx-auto py-8 px-4'>
                <div className='text-center mb-8'>
                    <h1 className='text-2xl font-bold'>Study Complete</h1>
                    <p className='text-muted-foreground'>Great job! You've completed your study session.</p>
                </div>

                <Card className='p-6'>
                    <div className='grid grid-cols-2 gap-4 mb-6'>
                        <div className='bg-muted p-4 rounded-lg text-center'>
                            <p className='text-3xl font-bold'>{stats.studied}</p>
                            <p className='text-sm text-muted-foreground'>Cards Studied</p>
                        </div>
                        <div className='bg-muted p-4 rounded-lg text-center'>
                            <p className='text-3xl font-bold'>{formatTime(totalTime)}</p>
                            <p className='text-sm text-muted-foreground'>Total Time</p>
                        </div>
                    </div>

                    <div className='flex justify-center'>
                        <Button onClick={endStudySession}>Return to Deck</Button>
                    </div>
                </Card>
            </div>
        );
    }

    const currentCard = cards[currentCardIndex];

    if (!currentCard) {
        return (
            <div className='max-w-2xl mx-auto py-8 px-4'>
                <Card className='p-6 mt-4'>
                    <div className='text-center py-12'>
                        <BarChart
                            className='h-12 w-12 mx-auto mb-4 text-muted-foreground'
                            onClick={() => navigate(`/deck/${deckId}`)}
                        />
                        <h3 className='text-lg font-medium mb-2'>No cards available</h3>
                        <p className='text-muted-foreground mb-6'>There seems to be an issue loading the cards.</p>
                        <Button onClick={() => navigate(`/deck/${deckId}`)}>Return to Deck</Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className='max-w-3xl h-full flex flex-col justify-center mx-auto py-8 px-4 animate-fade-in'>
            <div className='flex items-center justify-between mb-2'>
                <Button
                    variant='ghost'
                    onClick={handleExit}
                    className='transition-all duration-200 hover:-translate-x-1'
                >
                    <ChevronLeft className='h-4 w-4 mr-2' />
                    Exit
                </Button>
                <div className='text-center'>
                    <h1 className='text-xl font-bold'>Study</h1>
                    <p className='text-sm text-muted-foreground'>
                        {currentCardIndex + 1} of {cards.length} cards
                    </p>
                </div>
                <div className='flex items-center text-sm text-muted-foreground'>
                    <Clock className='h-4 w-4 mr-1 animate-pulse' />
                    {formatTime(currentCardTime)}
                </div>
            </div>

            <div className='w-full h-2 bg-muted rounded-full mb-6'>
                <div
                    className='h-2 bg-primary rounded-full transition-all duration-700 ease-in-out'
                    style={{ width: `${(currentCardIndex / cards.length) * 100}%` }}
                ></div>
            </div>

            <Card className='p-6 mb-6 min-h-[700px] flex flex-col shadow-md hover:shadow-lg transition-all duration-300 animate-slide-up '>
                {currentCard.tags && currentCard.tags.length > 0 && (
                    <div className='flex flex-wrap gap-1 mb-4'>
                        {currentCard.tags.map((tag) => (
                            <Badge key={tag} variant='secondary' className='animate-fade-in'>
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}

                <div className={cn('mb-4', !showAnswer && 'flex-grow')}>
                    <div
                        className='prose dark:prose-invert max-w-none animate-fade-in'
                        dangerouslySetInnerHTML={{ __html: currentCard.front }}
                    />

                    {currentCard.media && currentCard.media.length > 0 && (
                        <div className='mt-4'>
                            {currentCard.media.map((media, i) => {
                                if (media.type === 'image') {
                                    return (
                                        <img
                                            key={i}
                                            src={media.url}
                                            alt='Card media'
                                            className='max-h-[200px] rounded-md object-contain mb-2'
                                        />
                                    );
                                } else if (media.type === 'audio') {
                                    return <audio key={i} controls className='w-full mb-2' src={media.url} />;
                                } else if (media.type === 'video') {
                                    return (
                                        <video key={i} controls className='w-full max-h-[200px] mb-2' src={media.url} />
                                    );
                                }
                                return null;
                            })}
                        </div>
                    )}
                </div>

                {!showAnswer ? (
                    <div className='flex gap-5 animate-slide-up'>
                        <Button
                            variant='secondary'
                            onClick={() => {
                                handleSkip();
                            }}
                            className='w-full transition-all hover:bg-gray-200 active:scale-95'
                        >
                            Skip
                        </Button>
                        <Button
                            onClick={handleShowAnswer}
                            className='w-full transition-all hover:brightness-110 active:scale-95'
                        >
                            Show Answer
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className='border-t border-border pt-4 mb-4 flex-1 animate-fade-in'>
                            <div
                                className='prose dark:prose-invert max-w-none'
                                dangerouslySetInnerHTML={{ __html: currentCard.back }}
                            />
                        </div>

                        <div className='grid grid-cols-2 gap-2 mt-auto animate-slide-up'>
                            <Button
                                variant='outline'
                                className='border-red-400 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 transition-all active:scale-95'
                                onClick={() => handleRate(Rating.AGAIN)}
                            >
                                <X className='h-4 w-4 mr-2' />
                                Again
                            </Button>

                            <Button
                                variant='outline'
                                className='border-orange-400 text-orange-500 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950 transition-all active:scale-95'
                                onClick={() => handleRate(Rating.HARD)}
                            >
                                <PenIcon className='h-4 w-4 mr-2' />
                                Hard
                            </Button>

                            <Button
                                variant='outline'
                                className='border-green-400 text-green-500 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950 transition-all active:scale-95'
                                onClick={() => handleRate(Rating.GOOD)}
                            >
                                <Check className='h-4 w-4 mr-2' />
                                Good
                            </Button>

                            <Button
                                variant='outline'
                                className='border-blue-400 text-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 transition-all active:scale-95'
                                onClick={() => handleRate(Rating.EASY)}
                            >
                                <ArrowRight className='h-4 w-4 mr-2' />
                                Easy
                            </Button>
                        </div>
                    </>
                )}
            </Card>

            <div className='text-sm text-muted-foreground text-center animate-fade-in'>
                {stats.studied} of {stats.total} studied • {cards.length - currentCardIndex} remaining
            </div>

            <Dialog open={exitDialog} onOpenChange={setExitDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>End Study Session?</DialogTitle>
                        <DialogDescription>Your progress will be saved.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant='outline' onClick={() => setExitDialog(false)}>
                            Continue Studying
                        </Button>
                        <Button onClick={endStudySession}>End Session</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default StudyCard;
