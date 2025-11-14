import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Loader2, Settings2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import useGetClassUserById from '@/hooks/queries/use-get-class-user-id';
import useStartClassDeckSession from '@/hooks/queries/use-start-class-deck-session';
import useGetAllMoocs from '@/hooks/queries/use-get-all-mooc-class';
import useMe from '@/hooks/queries/use-me';
import ClassHeader from '@/components/class-header';
import DeckCard from '@/components/deck-card';
import TopLearners from '@/components/top-learners';
import StatsGrid from '@/components/stats-grid';
import ProgressCard from '@/components/moocs-card';
import ClassStudyDialog from '@/components/modals/ClassStudyDialog';
import ClassResumeSessionModal from '@/components/modals/ClassResumeSessionModal';

import { getToast } from '@/utils/getToast';
import { ClassStudySession, ClassStudyCard, TopLearner, DeckInClass } from '@/types/class';

function ClassDetailUser() {
    const { data: user } = useMe();
    const userId = user?._id;

    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();

    const [isExpanded, setIsExpanded] = useState(false);
    const [studyingDeck, setStudyingDeck] = useState<DeckInClass | null>(null);
    const [classSession, setClassSession] = useState<ClassStudySession | null>(null);
    const [sessionCards, setSessionCards] = useState<ClassStudyCard[]>([]);
    const [loadingSession, setLoadingSession] = useState(false);
    const [isResumedSession, setIsResumedSession] = useState(false);
    const [showResumeDialog, setShowResumeDialog] = useState(false);
    const [pendingDeck, setPendingDeck] = useState<DeckInClass | null>(null);
    const [pendingSessionData, setPendingSessionData] = useState<ClassStudySession | null>(null);
    const [moocPage, setMoocPage] = useState(1);

    const moocsPerPage = 6;

    const { data: classData, isLoading: isLoadingClass } = useGetClassUserById(classId ?? '');
    const { mutateAsync: startSession } = useStartClassDeckSession();
    const { data: allMoocs } = useGetAllMoocs(classId);

    if (!classId) {
        return <p>Class ID is missing.</p>;
    }

    if (isLoadingClass) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <Loader2 className='w-6 h-6 animate-spin' />
            </div>
        );
    }

    if (!classData) {
        return <p>Class not found or invalid ID.</p>;
    }

    const isOwner = user?._id === classData.owner._id;

    const allDecksRaw = classData.decks || [];
    const allDecks = allDecksRaw.filter((deck, index, self) => self.findIndex((d) => d._id === deck._id) === index);
    const scheduledDecks = allDecks.filter((deck) => deck.startTime && deck.endTime);

    const totalLearnersCount = classData.users?.length || 0;

    // Top learners
    const topLearners: TopLearner[] =
        classData.userClassStates
            ?.map((ucs) => ({
                id: ucs.user._id,
                name: ucs.user.name,
                avatar: ucs.user.avatar,
                points: ucs.points || 0,
                streak: ucs.studyStreak || 0
            }))
            .sort((a, b) => b.points - a.points)
            .slice(0, 5) || [];

    // Completion rate
    let completionRate = 0;
    if (scheduledDecks.length > 0) {
        const totalProgress = scheduledDecks.reduce((sum, deck) => {
            const deckProgress =
                deck.totalCount && deck.totalCount > 0 && deck.correctCount
                    ? (deck.correctCount / deck.totalCount) * 100
                    : 0;
            return sum + deckProgress;
        }, 0);
        completionRate = Math.round(totalProgress / scheduledDecks.length);
    }

    // Start study session
    const startStudyMode = async (deck: DeckInClass) => {
        setLoadingSession(true);
        try {
            const res = await startSession({ classId: classId!, deckId: deck._id });

            setSessionCards(res.cards || []);
            if (res.resumed) {
                setPendingDeck(deck);
                setPendingSessionData(res.session);
                setShowResumeDialog(true);
            } else {
                setClassSession(res.session);
                setStudyingDeck(deck);
                setIsResumedSession(false);
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
            setStudyingDeck(pendingDeck);
            setIsResumedSession(true);
            setShowResumeDialog(false);
            setPendingDeck(null);
            setPendingSessionData(null);
        }
    };

    const handleStartNewSession = async () => {
        if (pendingDeck) {
            try {
                const res = await startSession({ classId: classId!, deckId: pendingDeck._id, forceNew: true });
                setClassSession(res.session);
                setSessionCards(res.cards || []);
                setStudyingDeck(pendingDeck);
                setIsResumedSession(false);
                setShowResumeDialog(false);
                setPendingDeck(null);
                setPendingSessionData(null);
            } catch {
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

    // Filter & paginate MOOCs
    const filteredMoocs = allMoocs?.data?.filter((mooc) => isOwner || mooc.publicStatus === 2) || [];
    const paginatedMoocs = filteredMoocs.slice(0, moocPage * moocsPerPage);
    const hasMoreMoocs = paginatedMoocs.length < filteredMoocs.length;
    console.log('Filtered MOOCs:', filteredMoocs);
    const [paymentPopup, setPaymentPopup] = useState<{ open: boolean; mooc?: any }>({
        open: false,
        mooc: undefined
    });

    const handleMOOCClick = (mooc: any) => {
        if (isOwner) {
            navigate(`/class/${classData._id}/mooc/${mooc._id}`);
            return;
        }

        if (mooc.isPaid) {
            if (mooc.enrolledUsers?.includes(userId)) {
                navigate(`/class/${classData._id}/mooc/${mooc._id}`);
            } else {
                setPaymentPopup({ open: true, mooc });
            }
            return;
        }

        if (mooc.locked && !mooc.isPaid) {
            setPaymentPopup({ open: true, mooc });
            return;
        }
    };

    console.log('isOwner:', isOwner, 'userId:', userId, 'ownerId:', classData.owner._id);

    return (
        <div className='min-h-screen bg-background'>
            <main className='container mx-auto px-4 py-8 max-w-7xl'>
                <ClassHeader
                    classData={{
                        _id: classData._id,
                        name: classData.name,
                        description: classData.description,
                        bannerUrl: classData.bannerUrl,
                        visibility: classData.visibility,
                        requiredApprovalToJoin: classData.requiredApprovalToJoin,
                        completionRate
                    }}
                    isExpanded={isExpanded}
                    onToggleExpanded={() => setIsExpanded(!isExpanded)}
                    totalLearnersCount={totalLearnersCount}
                    totalDecksCount={classData.decks.length}
                />

                <div className='mb-8 flex justify-between items-center'>
                    <h2 className='text-2xl font-bold'>Class Status</h2>
                    {isOwner && (
                        <Link to={`/class/${classData._id}/management`}>
                            <Button variant='default' size='default' className='flex items-center gap-2'>
                                <Settings2 className='h-4 w-4' /> Manage Class
                            </Button>
                        </Link>
                    )}
                </div>

                <StatsGrid
                    totalLearnersCount={totalLearnersCount}
                    createdAt={classData.createdAt}
                    completionRate={completionRate}
                    visited={classData.visited?.history?.length ?? 0}
                />

                {/* MOOCs */}
                <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
                    <div className='lg:col-span-3'>
                        <h2 className='text-2xl font-bold mb-4'>Available MOOCs</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            {paginatedMoocs.map((mooc: any) => {
                                const isPaid = mooc.isPaid;
                                const isLocked = mooc.locked;

                                let status: 'available' | 'locked' | 'paid' = 'available';

                                if (isPaid) {
                                    status = 'paid';
                                } else if (isLocked) {
                                    status = 'locked';
                                } else {
                                    status = 'available';
                                }

                                const isDisabledForNonOwner = !isOwner && mooc.locked && !mooc.isPaid;

                                return (
                                    <div key={mooc._id} className='relative group'>
                                        <ProgressCard
                                            title={mooc.title}
                                            description={mooc.description || 'Không có mô tả'}
                                            progress={0}
                                            status={status}
                                            onClick={() => {
                                                if (!isDisabledForNonOwner) handleMOOCClick(mooc);
                                            }}
                                            isOwner={isOwner}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                        {hasMoreMoocs && (
                            <div className='flex justify-center mt-4'>
                                <Button variant='outline' onClick={() => setMoocPage((prev) => prev + 1)}>
                                    Load More
                                </Button>
                            </div>
                        )}

                        {/* Scheduled Decks */}
                        {scheduledDecks.length > 0 && (
                            <div className='mt-8'>
                                <h3 className='pl-2 text-xl font-semibold mb-4'>Scheduled Decks</h3>
                                <div className='pl-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                    {scheduledDecks.map((deck, idx) => (
                                        <DeckCard
                                            key={deck._id}
                                            deck={{ ...deck, totalCount: deck.totalCount ?? deck.cardCount }}
                                            index={idx}
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
                            classId={classId!}
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

            <ClassResumeSessionModal
                open={showResumeDialog}
                onClose={handleCloseResumeDialog}
                onContinue={handleContinueSession}
                onStartNew={handleStartNewSession}
                pendingSessionData={pendingSessionData}
            />
            {paymentPopup.open && paymentPopup.mooc && (
                <Dialog open={paymentPopup.open} onOpenChange={() => setPaymentPopup({ open: false, mooc: undefined })}>
                    <DialogContent className='sm:max-w-md'>
                        <DialogHeader>
                            <DialogTitle>Payment Required</DialogTitle>
                        </DialogHeader>
                        <p className='text-sm text-muted-foreground'>
                            To continue studying "<strong className='text-foreground'>{paymentPopup.mooc.title}</strong>
                            ", you need to pay{' '}
                            <strong className='text-foreground'>
                                {paymentPopup.mooc.price} {paymentPopup.mooc.currency || 'VND'}
                            </strong>
                            .
                        </p>
                        <DialogFooter>
                            <Button variant='outline' onClick={() => setPaymentPopup({ open: false, mooc: undefined })}>
                                Cancel
                            </Button>
                            <Button
                                variant='destructive'
                                onClick={() => {
                                    console.log('Redirect to payment API for', paymentPopup.mooc._id);
                                    // call payment API or navigate
                                }}
                            >
                                Pay Now
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}

export default ClassDetailUser;
