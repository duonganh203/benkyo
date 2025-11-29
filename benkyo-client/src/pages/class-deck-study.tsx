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
import useUpdateDeckProgress from '@/hooks/queries/use-update-progress-for-use';

const DeckStudy: React.FC = () => {
    const { classId, deckId, moocId } = useParams<{
        classId: string;
        deckId: string;
        moocId: string;
    }>();
    const navigate = useNavigate();
    const { data: user } = useMe();
    const { data: mooc, isLoading: isMoocLoading } = useGetMoocDetail(moocId!) as {
        data?: any;
        isLoading: boolean;
    };
    const { data: cardsData, isLoading: isCardsLoading } = useGetDeckCards(deckId ?? '');
    const totalCards = Array.isArray(cardsData) ? cardsData.length : 0;

    const storageKey = `deck-${deckId}-lastSeenIndex`;

    // Lấy lastSeenIndex từ sessionStorage ngay khi khởi tạo state
    const savedIndex = typeof window !== 'undefined' ? sessionStorage.getItem(storageKey) : null;
    const initialIndex = savedIndex !== null ? Number(savedIndex) : 0;

    const [currentCardIndex, setCurrentCardIndex] = useState(initialIndex);
    const [furthestCardIndex, setFurthestCardIndex] = useState(initialIndex);
    const [progressPercent, setProgressPercent] = useState(
        totalCards > 0 ? Math.floor(((initialIndex + 1) / totalCards) * 100) : 0
    );
    const [studyCompleted, setStudyCompleted] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const updateProgress = useUpdateDeckProgress();

    // Khi dữ liệu backend sẵn sàng, ưu tiên giá trị backend nếu lớn hơn sessionStorage
    useEffect(() => {
        if (!mooc || !user?._id || !deckId) return;

        const enrolledUser = mooc.enrolledUsers.find((u: any) => {
            const uid = u.user?._id ? u.user._id : u.user;
            return uid?.toString() === user._id.toString();
        });
        if (!enrolledUser) return;

        const deckProg = enrolledUser.deckProgress.find((d: any) => {
            const did = d.deck?._id ? d.deck._id : d.deck;
            return did?.toString() === deckId;
        });

        const backendIndex = deckProg?.lastSeenIndex ?? 0;

        if (backendIndex > initialIndex) {
            setCurrentCardIndex(backendIndex);
            setFurthestCardIndex(backendIndex);
            setProgressPercent(totalCards > 0 ? Math.floor(((backendIndex + 1) / totalCards) * 100) : 0);
        }

        setIsInitialLoad(false);
    }, [mooc, user, deckId, totalCards, initialIndex]);

    // Lưu furthestCardIndex vào sessionStorage
    useEffect(() => {
        sessionStorage.setItem(storageKey, String(furthestCardIndex));
    }, [furthestCardIndex, storageKey]);

    const isOwner = user?._id === mooc?.owner?._id;
    const canAccess = isOwner || mooc?.publicStatus === 2;

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

    if (!canAccess) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <p className='text-lg text-muted-foreground'>You do not have permission to access this MOOC.</p>
            </div>
        );
    }

    const handleBack = () => navigate(-1);
    const handleQuizHub = (deckId: string) => navigate(`/class/${classId}/mooc/${moocId}/deck/${deckId}/quiz-hub`);

    const handleCardChange = (i: number) => {
        setCurrentCardIndex(i);

        // chỉ update backend nếu index mới lớn hơn furthestCardIndex
        if (!isInitialLoad && i > furthestCardIndex) {
            updateProgress.mutate({
                moocId,
                deckId,
                lastSeenIndex: i,
                totalCards
            });
            setFurthestCardIndex(i);
        }

        // progressPercent dựa trên furthestCardIndex
        const newFurthest = Math.max(furthestCardIndex, i);
        const percent = totalCards > 0 ? Math.floor(((newFurthest + 1) / totalCards) * 100) : 0;
        setProgressPercent(percent);
    };

    const handleFinishStudy = () => {
        if (progressPercent === 100) {
            setStudyCompleted(true);
            getToast('success', 'You have completed this deck!');
        } else {
            getToast('error', 'Please review all flashcards before finishing!');
        }
    };

    const handleRestart = () => {
        setCurrentCardIndex(0);
        setFurthestCardIndex(0);
        setProgressPercent(0);
        setStudyCompleted(false);
        sessionStorage.removeItem(storageKey);
    };

    if (totalCards === 0) {
        return (
            <div className='min-h-screen bg-background flex flex-col'>
                <header>
                    <div className='max-w-4xl mx-auto flex justify-between items-center py-4 px-4'>
                        <Button variant='outline' onClick={handleBack} className='flex items-center gap-2'>
                            <ChevronLeft className='h-5 w-5' /> Back
                        </Button>
                        <div className='text-center flex-1'>
                            <h1 className='text-xl font-semibold text-foreground'>Deck Title</h1>
                            <p className='text-sm text-muted-foreground'>Study Mode</p>
                        </div>
                        <div className='w-[70px]' />
                    </div>
                </header>
                <main className='flex-1 flex items-center justify-center px-4'>
                    <Card className='max-w-md w-full text-center shadow-lg border bg-card p-6'>
                        <CardContent>
                            <BookOpen className='w-16 h-16 text-muted-foreground mx-auto mb-4' />
                            <h2 className='text-2xl font-semibold text-foreground mb-2'>No Cards</h2>
                            <p className='text-lg text-muted-foreground'>No flashcards available in this deck.</p>
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
                            <Button
                                variant='outline'
                                onClick={() => handleQuizHub(deckId)}
                                className='flex items-center gap-2'
                            >
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
                        <h1 className='text-xl font-semibold text-foreground'>Deck Study</h1>
                        <p className='text-sm text-muted-foreground'>Study Mode</p>
                    </div>
                    <div className='w-20' />
                </div>
            </header>

            <main className='py-12 px-4 flex flex-col items-center gap-6'>
                <div className='w-full max-w-2xl'>
                    <FlashcardViewer
                        cards={Array.isArray(cardsData) ? cardsData : []}
                        currentIndex={currentCardIndex}
                        onCardChange={handleCardChange}
                    />
                </div>
                <Button
                    onClick={handleFinishStudy}
                    disabled={progressPercent < 100}
                    className={`mt-6 px-8 py-3 rounded-full text-lg font-semibold text-white 
                        bg-gradient-to-r ${progressPercent === 100 ? 'from-green-500 to-emerald-600' : 'from-gray-400 to-gray-500'} 
                        transition-all duration-300 shadow-lg flex items-center gap-2`}
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
