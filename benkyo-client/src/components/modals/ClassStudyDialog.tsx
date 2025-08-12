import React, { useEffect, useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Check, X, ArrowRight, ChevronLeft, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import useGetClassDeckSessionHistory from '@/hooks/queries/use-get-class-deck-session-history';
import useSaveClassDeckAnswer from '@/hooks/queries/use-save-class-deck-answer';
import useEndClassDeckSession from '@/hooks/queries/use-end-class-deck-session';
import { getToast } from '@/utils/getToast';
import { ClassStudySession, ClassStudyCard } from '@/types/class';

interface ClassStudyDialogProps {
    open: boolean;
    onClose: () => void;
    classId: string;
    deckId: string;
    session: ClassStudySession;
    cards: ClassStudyCard[];
    isResumedSession?: boolean;
}

const ClassStudyDialog: React.FC<ClassStudyDialogProps> = ({
    open,
    onClose,
    classId,
    deckId,
    session,
    cards,
    isResumedSession = false
}) => {
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState<{ cardId: string; correct: boolean }[]>([]);
    const [finished, setFinished] = useState(false);
    const [showBack, setShowBack] = useState(false);
    const [currentCardTime, setCurrentCardTime] = useState(0);
    const [sessionStartTime] = useState(new Date());
    const [showHistory, setShowHistory] = useState(false);

    const timerRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(Date.now());
    const queryClient = useQueryClient();

    const {
        data: sessionHistory = [],
        isLoading: loadingHistory,
        refetch: refetchHistory
    } = useGetClassDeckSessionHistory(classId, deckId);
    const { mutateAsync: saveAnswer } = useSaveClassDeckAnswer();
    const { mutateAsync: endSession } = useEndClassDeckSession();

    useEffect(() => {
        if (open && cards.length > 0) {
            setCurrent(0);
            setAnswers([]);
            setFinished(false);
            setShowBack(false);
            setCurrentCardTime(0);
            setShowHistory(false);
            startTimeRef.current = Date.now();
        }
    }, [open, cards, isResumedSession, session]);

    useEffect(() => {
        if (open && !finished) {
            startTimeRef.current = Date.now();
            setCurrentCardTime(0);

            const interval = setInterval(() => {
                setCurrentCardTime(Math.round((Date.now() - startTimeRef.current) / 1000));
            }, 1000);

            timerRef.current = interval as unknown as number;

            return () => {
                if (timerRef.current) clearInterval(timerRef.current);
            };
        }
    }, [current, open, finished]);

    useEffect(() => {
        if (open && !finished) {
            startTimeRef.current = Date.now();
            setCurrentCardTime(0);
        }
    }, [current]);

    const formatTime = (seconds: number): string => {
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    const handleAnswer = async (correct: boolean) => {
        const newAnswers = [...answers, { cardId: cards[current]._id, correct }];
        setAnswers(newAnswers);
        setShowBack(false);

        try {
            await saveAnswer({
                classId,
                deckId,
                sessionId: session._id,
                cardId: cards[current]._id,
                correct
            });

            queryClient.invalidateQueries({ queryKey: ['classClassUserId', classId] });
        } catch {
            getToast('error', 'Failed to save answer');
        }

        if (current < cards.length - 1) {
            setCurrent(current + 1);
        } else {
            setFinished(true);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }

            const sessionDuration = Math.round((Date.now() - sessionStartTime.getTime()) / 1000);

            try {
                await endSession({
                    classId,
                    deckId,
                    sessionId: session._id,
                    duration: sessionDuration
                });

                queryClient.invalidateQueries({ queryKey: ['class-user', classId] });
                queryClient.invalidateQueries({ queryKey: ['class', classId] });

                refetchHistory();
            } catch {
                getToast('error', 'Failed to end session');
            }
        }
    };

    const handleSkip = () => {
        setShowBack(false);
        if (current < cards.length - 1) {
            setCurrent(current + 1);
        } else {
            setFinished(true);
        }
    };

    const handleClose = () => {
        queryClient.invalidateQueries({ queryKey: ['class-user', classId] });
        onClose();
    };

    if (!open) return null;

    if (showHistory) {
        return (
            <Dialog open={true} onOpenChange={() => setShowHistory(false)}>
                <DialogContent className='max-w-3xl w-full'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <History className='h-5 w-5' />
                            Study History
                        </DialogTitle>
                    </DialogHeader>

                    <div className='py-4'>
                        {loadingHistory ? (
                            <div className='text-center py-8'>Loading history...</div>
                        ) : sessionHistory.length === 0 ? (
                            <div className='text-center py-8 text-muted-foreground'>No completed sessions yet</div>
                        ) : (
                            <div className='space-y-3'>
                                {sessionHistory
                                    .filter((s) => s.endTime)
                                    .map((historySession, index) => {
                                        const date = new Date(historySession.startTime);
                                        const percentage =
                                            historySession.totalCount > 0
                                                ? Math.round(
                                                      (historySession.correctCount / historySession.totalCount) * 100
                                                  )
                                                : 0;

                                        return (
                                            <div
                                                key={historySession._id}
                                                className='flex items-center justify-between p-4 bg-muted rounded-lg'
                                            >
                                                <div className='flex-1'>
                                                    <div className='flex items-center gap-3'>
                                                        <Badge variant='outline'>
                                                            Session{' '}
                                                            {sessionHistory.filter((s) => s.endTime).length - index}
                                                        </Badge>
                                                        <span className='text-sm text-muted-foreground'>
                                                            {date.toLocaleDateString('en-US')}{' '}
                                                            {date.toLocaleTimeString('en-US', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <div className='mt-2 flex items-center gap-4'>
                                                        <span className='text-sm'>
                                                            <strong>
                                                                {historySession.correctCount}/
                                                                {historySession.totalCount}
                                                            </strong>{' '}
                                                            correct
                                                        </span>
                                                        <span className='text-sm'>
                                                            <strong>{percentage}%</strong>
                                                        </span>
                                                        <span className='text-sm text-muted-foreground'>
                                                            {formatTime(historySession.duration || 0)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div
                                                    className={cn(
                                                        'px-3 py-1 rounded-full text-sm font-medium',
                                                        percentage >= 80
                                                            ? 'bg-green-100 text-green-700'
                                                            : percentage >= 60
                                                              ? 'bg-yellow-100 text-yellow-700'
                                                              : 'bg-red-100 text-red-700'
                                                    )}
                                                >
                                                    {percentage}%
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}

                        <div className='flex justify-between mt-6'>
                            <Button variant='outline' onClick={() => setShowHistory(false)}>
                                <ChevronLeft className='h-4 w-4 mr-2' />
                                Back
                            </Button>
                            <Button onClick={() => setShowHistory(false)}>Start Study</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (finished) {
        const totalTime = Math.round((Date.now() - sessionStartTime.getTime()) / 1000);

        const currentCorrect = answers.filter((a) => a.correct).length;

        const previousCorrect = isResumedSession ? session?.correctCount || 0 : 0;
        const previousTotal = isResumedSession ? session?.completedCardIds?.length || 0 : 0;

        const totalCorrect = previousCorrect + currentCorrect;
        const totalAnswered = previousTotal + cards.length;

        return (
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className='max-w-2xl w-full'>
                    <DialogHeader>
                        <DialogTitle>Session Complete!</DialogTitle>
                    </DialogHeader>

                    <div className='text-center py-8'>
                        <h3 className='text-2xl font-bold mb-4'>Study Complete</h3>
                        <p className='text-muted-foreground mb-6'>Great! You have completed this study session.</p>

                        <div className='grid grid-cols-2 gap-4 mb-6'>
                            <div className='bg-muted p-4 rounded-lg text-center'>
                                <p className='text-3xl font-bold'>
                                    {totalCorrect}/{totalAnswered}
                                </p>
                                <p className='text-sm text-muted-foreground'>Total Correct</p>
                                {isResumedSession && (
                                    <p className='text-xs text-gray-500 mt-1'>
                                        This session: {currentCorrect}/{cards.length}
                                    </p>
                                )}
                            </div>
                            <div className='bg-muted p-4 rounded-lg text-center'>
                                <p className='text-3xl font-bold'>{formatTime(totalTime)}</p>
                                <p className='text-sm text-muted-foreground'>Session Time</p>
                            </div>
                        </div>

                        <div className='flex gap-3 justify-center'>
                            <Button
                                variant='outline'
                                onClick={() => {
                                    setCurrent(0);
                                    setAnswers([]);
                                    setFinished(false);
                                    setShowBack(false);
                                    setCurrentCardTime(0);
                                    startTimeRef.current = Date.now();
                                }}
                                className='flex items-center gap-2'
                            >
                                <ArrowRight className='h-4 w-4' />
                                Study Again
                            </Button>
                            <Button
                                variant='outline'
                                onClick={() => {
                                    setShowHistory(true);
                                }}
                                className='flex items-center gap-2'
                            >
                                <History className='h-4 w-4' />
                                View History
                            </Button>
                            <Button onClick={handleClose}>Close</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (cards.length === 0) {
        return (
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className='max-w-2xl w-full'>
                    <DialogHeader>
                        <DialogTitle>Study Deck in Class</DialogTitle>
                    </DialogHeader>
                    <div className='text-center py-8'>No flashcards available to study.</div>
                </DialogContent>
            </Dialog>
        );
    }

    const currentCard = cards[current];

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className='max-w-4xl w-full max-h-[90vh] p-0'>
                <div className='flex flex-col h-full p-6'>
                    <div className='flex items-center justify-between mb-4'>
                        <Button variant='ghost' onClick={handleClose} className='flex items-center gap-2'>
                            <ChevronLeft className='h-4 w-4' />
                            Exit
                        </Button>
                        <div className='text-center'>
                            <h1 className='text-xl font-bold'>Study Deck in Class</h1>
                            <p className='text-sm text-muted-foreground'>
                                {isResumedSession && session?.completedCardIds
                                    ? `${session.completedCardIds.length + current + 1} / ${session.completedCardIds.length + cards.length} cards`
                                    : `${current + 1} / ${cards.length} cards`}
                            </p>
                        </div>
                        <div className='flex items-center gap-3'>
                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => {
                                    setShowHistory(true);
                                }}
                                className='flex items-center gap-2'
                            >
                                <History className='h-4 w-4' />
                                History
                            </Button>
                            <div className='flex items-center text-sm text-muted-foreground'>
                                <Clock className='h-4 w-4 mr-1 animate-pulse' />
                                {formatTime(currentCardTime)}
                            </div>
                        </div>
                    </div>

                    <div className='w-full h-2 bg-muted rounded-full mb-6'>
                        <div
                            className='h-2 bg-primary rounded-full transition-all duration-700 ease-in-out'
                            style={{
                                width:
                                    isResumedSession && session?.completedCardIds
                                        ? `${((session.completedCardIds.length + current) / (session.completedCardIds.length + cards.length)) * 100}%`
                                        : `${(current / cards.length) * 100}%`
                            }}
                        />
                    </div>

                    <Card className='p-6 mb-6 min-h-[400px] flex flex-col shadow-md hover:shadow-lg transition-all duration-300'>
                        {currentCard.tags && currentCard.tags.length > 0 && (
                            <div className='flex flex-wrap gap-1 mb-4'>
                                {currentCard.tags.map((tag) => (
                                    <Badge key={tag} variant='secondary' className='animate-fade-in'>
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        <div className={cn('mb-4', !showBack && 'flex-grow')}>
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
                                                <video
                                                    key={i}
                                                    controls
                                                    className='w-full max-h-[200px] mb-2'
                                                    src={media.url}
                                                />
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            )}
                        </div>

                        {showBack && (
                            <div className='border-t border-border pt-4 mb-4 flex-1 animate-fade-in'>
                                <div
                                    className='prose dark:prose-invert max-w-none'
                                    dangerouslySetInnerHTML={{ __html: currentCard.back }}
                                />
                            </div>
                        )}

                        {!showBack ? (
                            <div className='flex gap-4 animate-slide-up'>
                                <Button
                                    variant='secondary'
                                    onClick={handleSkip}
                                    className='w-full transition-all hover:bg-gray-200 active:scale-95'
                                >
                                    Skip
                                </Button>
                                <Button
                                    onClick={() => setShowBack(true)}
                                    className='w-full transition-all hover:brightness-110 active:scale-95'
                                >
                                    Show Answer
                                </Button>
                            </div>
                        ) : (
                            <div className='grid grid-cols-2 gap-2 mt-auto animate-slide-up'>
                                <Button
                                    variant='outline'
                                    className='border-red-400 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 transition-all active:scale-95'
                                    onClick={() => handleAnswer(false)}
                                >
                                    <X className='h-4 w-4 mr-2' />
                                    Incorrect
                                </Button>
                                <Button
                                    variant='outline'
                                    className='border-green-400 text-green-500 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950 transition-all active:scale-95'
                                    onClick={() => handleAnswer(true)}
                                >
                                    <Check className='h-4 w-4 mr-2' />
                                    Correct
                                </Button>
                            </div>
                        )}
                    </Card>

                    <div className='text-sm text-muted-foreground text-center animate-fade-in'>
                        {isResumedSession && session?.completedCardIds
                            ? `${session.completedCardIds.length + answers.length} / ${session.completedCardIds.length + cards.length} total studied • ${cards.length - current} remaining this session`
                            : `${answers.length} / ${cards.length} studied • ${cards.length - current} remaining`}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ClassStudyDialog;
