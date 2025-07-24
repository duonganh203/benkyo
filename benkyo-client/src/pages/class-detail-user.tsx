import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, Settings2, Clock } from 'lucide-react';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import useAuthStore from '@/hooks/stores/use-auth-store';
import { DeckInClass } from '@/components/deck-card';
import useGetClassUserById from '@/hooks/queries/use-get-class-user-id';
import ClassHeader from '@/components/class-header';
import DeckCard from '@/components/deck-card';
import TopLearners from '@/components/top-learners';
import StatsGrid from '@/components/stats-grid';
import ClassStudyDialog from '@/components/modals/ClassStudyDialog';
import useStartClassDeckSession from '@/hooks/queries/use-start-class-deck-session';
import { getToast } from '@/utils/getToast';

function ClassDetailUser() {
    const { user } = useAuthStore();
    const { classId } = useParams<{ classId: string }>();
    const [isExpanded, setIsExpanded] = useState(false);
    const [studyingDeck, setStudyingDeck] = useState<DeckInClass | null>(null);
    const [classSession, setClassSession] = useState<any>(null);
    const [sessionCards, setSessionCards] = useState<any[]>([]);
    const [loadingSession, setLoadingSession] = useState(false);
    const [isResumedSession, setIsResumedSession] = useState(false);
    const [showResumeDialog, setShowResumeDialog] = useState(false);
    const [pendingDeck, setPendingDeck] = useState<DeckInClass | null>(null);
    const [pendingSessionData, setPendingSessionData] = useState<any>(null);

    const { data: classData, isLoading: isLoadingClass } = useGetClassUserById(classId ?? '');
    const { mutateAsync: startSession } = useStartClassDeckSession();

    if (!classId) {
        return (
            <div className='min-h-screen flex flex-col justify-center items-center'>
                <p className='text-muted-foreground text-lg'>Class ID is missing.</p>
            </div>
        );
    }

    if (isLoadingClass) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <Loader2 className='w-6 h-6 animate-spin' />
            </div>
        );
    }

    if (!classData) {
        return (
            <div className='min-h-screen flex flex-col justify-center items-center'>
                <p className='text-muted-foreground text-lg'>Class not found or invalid ID.</p>
            </div>
        );
    }

    const isOwner = user?._id === classData.owner._id;
    const totalLearnersCount = classData.users?.length || 0;

    const allDecksRaw = classData.decks || [];
    const allDecks = allDecksRaw.filter((deck, index, self) => self.findIndex((d) => d._id === deck._id) === index);
    const scheduledDecks = allDecks.filter((deck: any) => deck.startTime && deck.endTime);
    const moreDecks = allDecks.filter((deck: any) => !deck.startTime || !deck.endTime);

    const topLearners =
        classData.userClassStates
            ?.map((ucs: any) => {
                return {
                    id: ucs.user._id,
                    name: ucs.user.name,
                    avatar: ucs.user.avatar,
                    points: ucs.completedCardIds?.length || 0,
                    streak: 0
                };
            })
            .sort((a: any, b: any) => b.points - a.points)
            .slice(0, 5) || [];

    let completionRate = 0;
    if (scheduledDecks.length > 0) {
        const totalProgress = scheduledDecks.reduce((sum, deck: any) => {
            const deckProgress = deck.totalCount > 0 ? (deck.correctCount / deck.totalCount) * 100 : 0;
            return sum + deckProgress;
        }, 0);
        completionRate = Math.round(totalProgress / scheduledDecks.length);
    }

    const startStudyMode = async (deck: DeckInClass) => {
        setLoadingSession(true);
        try {
            const res = await startSession({
                classId: classId!,
                deckId: deck._id
            });

            setSessionCards(res.cards || []);

            if (res.resumed) {
                setPendingDeck(deck);
                setPendingSessionData(res.data);
                setShowResumeDialog(true);
            } else {
                setClassSession(res.data);
                setIsResumedSession(false);
                setStudyingDeck(deck);
            }
        } finally {
            setLoadingSession(false);
        }
    };

    const closeStudyDialog = () => {
        setStudyingDeck(null);
        setSessionCards([]);
        setClassSession(null);
        setIsResumedSession(false);
    };

    const handleContinueSession = () => {
        if (pendingDeck && pendingSessionData) {
            setClassSession(pendingSessionData);
            setIsResumedSession(true);
            setStudyingDeck(pendingDeck);
            setShowResumeDialog(false);
            setPendingDeck(null);
            setPendingSessionData(null);
        }
    };

    const handleStartNewSession = async () => {
        if (pendingDeck) {
            try {
                const res2 = await startSession({
                    classId: classId!,
                    deckId: pendingDeck._id,
                    forceNew: true
                });
                setClassSession(res2.data);
                setSessionCards(res2.cards || []);
                setIsResumedSession(false);
                setStudyingDeck(pendingDeck);
                setShowResumeDialog(false);
                setPendingDeck(null);
                setPendingSessionData(null);
            } catch (error) {
                getToast('error', 'Failed to start new session');
            }
        }
    };

    const handleCloseResumeDialog = () => {
        setShowResumeDialog(false);
        setPendingDeck(null);
        setPendingSessionData(null);
        setLoadingSession(false);
    };

    return (
        <div className='min-h-screen bg-background'>
            <main className='container mx-auto px-4 py-8 max-w-7xl'>
                <div className='mb-8'>
                    <ClassHeader
                        classData={{
                            _id: classData._id,
                            name: classData.name,
                            description: classData.description,
                            bannerUrl: classData.bannerUrl,
                            visibility: classData.visibility,
                            requiredApprovalToJoin: classData.requiredApprovalToJoin,
                            completionRate: completionRate
                        }}
                        isExpanded={isExpanded}
                        onToggleExpanded={() => setIsExpanded(!isExpanded)}
                        totalLearnersCount={totalLearnersCount}
                        totalDecksCount={classData.decks.length}
                    />
                </div>

                <div className='mb-4 flex justify-between items-center'>
                    <h2 className='text-2xl font-bold'>Class Status</h2>
                    {isOwner && (
                        <Link to={`/class/${classData._id}/management`}>
                            <Button variant='default' size='default' className='flex items-center gap-2'>
                                <Settings2 className='h-4 w-4' />
                                Manage Class
                            </Button>
                        </Link>
                    )}
                </div>

                <div className='mb-8'>
                    <StatsGrid
                        totalLearnersCount={totalLearnersCount}
                        createdAt={classData.createdAt}
                        completionRate={completionRate}
                        visited={classData.visited.history.length || 0}
                    />
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
                    <div className='lg:col-span-3'>
                        <div className='flex items-center justify-between mb-6'>
                            <h2 className='text-2xl font-bold'>Flashcard Decks</h2>
                        </div>

                        {scheduledDecks.length > 0 && (
                            <div className='mb-6'>
                                <h3 className='pl-2 text-xl font-semibold mb-4'>Scheduled Decks</h3>
                                <div className='pl-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                    {scheduledDecks.map((deck, index) => (
                                        <DeckCard
                                            key={`scheduled-${deck._id}`}
                                            deck={
                                                {
                                                    ...(deck as any),
                                                    totalCount: (deck as any).totalCount ?? (deck as any).cardCount
                                                } as DeckInClass
                                            }
                                            index={index}
                                            onStartStudy={startStudyMode}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {moreDecks.length > 0 && (
                            <div>
                                <h3 className='pl-4 text-xl font-semibold mb-4'>More Decks</h3>
                                <div className='pl-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                    {moreDecks.map((deck, index) => (
                                        <DeckCard
                                            key={`more-${deck._id}`}
                                            deck={
                                                {
                                                    ...(deck as any),
                                                    totalCount: (deck as any).totalCount ?? (deck as any).cardCount
                                                } as DeckInClass
                                            }
                                            index={index}
                                            onStartStudy={startStudyMode}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <aside className='lg:col-span-1'>
                        <TopLearners topLearners={topLearners} />
                    </aside>
                </div>
            </main>

            <Dialog open={!!studyingDeck} onOpenChange={(isOpen) => !isOpen && closeStudyDialog()}>
                <DialogContent className='max-w-2xl w-full'>
                    {studyingDeck && classSession && (
                        <ClassStudyDialog
                            open={!!studyingDeck}
                            onClose={closeStudyDialog}
                            classId={classId}
                            deckId={studyingDeck._id}
                            session={classSession}
                            cards={sessionCards}
                            isResumedSession={isResumedSession}
                        />
                    )}
                    {loadingSession && (
                        <div className='flex items-center justify-center h-full'>Loading session...</div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={showResumeDialog} onOpenChange={(isOpen) => !isOpen && handleCloseResumeDialog()}>
                <DialogContent className='max-w-md w-full'>
                    <div className='text-center py-6'>
                        <div className='mb-4'>
                            <div className='mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4'>
                                <Clock className='h-6 w-6 text-blue-600' />
                            </div>
                            <h3 className='text-lg font-semibold mb-2'>Unfinished Session</h3>
                            <p className='text-muted-foreground text-sm'>
                                You have an unfinished study session for this deck. Continue or start a new one?
                            </p>
                        </div>

                        {pendingSessionData && (
                            <div className='mb-6 p-3 bg-muted rounded-lg'>
                                <p className='text-sm'>
                                    <strong>{pendingSessionData.completedCardIds?.length || 0}</strong> flashcards
                                    completed
                                </p>
                                <p className='text-xs text-muted-foreground mt-1'>
                                    Started: {new Date(pendingSessionData.startTime).toLocaleString('en-US')}
                                </p>
                            </div>
                        )}

                        <div className='flex gap-3'>
                            <Button variant='outline' onClick={handleStartNewSession} className='flex-1'>
                                Start New
                            </Button>
                            <Button onClick={handleContinueSession} className='flex-1'>
                                Continue
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default ClassDetailUser;
