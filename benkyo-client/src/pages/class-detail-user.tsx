import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Loader2, Settings2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import useGetClassUserById from '@/hooks/queries/use-get-class-user-id';
import useStartClassDeckSession from '@/hooks/queries/use-start-class-deck-session';
import useGetAllMoocs from '@/hooks/queries/use-get-all-mooc-class';
import useMe from '@/hooks/queries/use-me';
import useLeaveClass from '@/hooks/queries/use-leave-class';
import ClassHeader from '@/components/class-header';
import DeckCard from '@/components/deck-card';
import TopLearners from '@/components/top-learners';
import StatsGrid from '@/components/stats-grid';
import ProgressCard from '@/components/moocs-card';
import ClassStudyDialog from '@/components/modals/ClassStudyDialog';
import ClassResumeSessionModal from '@/components/modals/ClassResumeSessionModal';

import { getToast } from '@/utils/getToast';
import { ClassStudySession, ClassStudyCard, TopLearner, DeckInClass } from '@/types/class';
import ConfirmLeaveClassModal from '@/components/modals/confirm-leave-class-modal';
import useEnrollUser from '@/hooks/queries/use-enroll-mooc';
import usePurchaseMooc from '@/hooks/queries/use-purchase-mooc';
import useAuthStore from '@/hooks/stores/use-auth-store';
function ClassDetailUser() {
    const { data: user } = useMe();
    const userId = user?._id;
    const auth = useAuthStore((authStore) => authStore);

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
    const [paymentPopup, setPaymentPopup] = useState<{ open: boolean; mooc?: any }>({
        open: false,
        mooc: undefined
    });
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const [leaving, setLeaving] = useState(false);

    const moocsPerPage = 6;

    const { data: classData, isLoading: isLoadingClass } = useGetClassUserById(classId ?? '');
    const { mutateAsync: startSession } = useStartClassDeckSession();
    const { data: allMoocs } = useGetAllMoocs(classId);
    const { mutateAsync: leaveClass } = useLeaveClass();
    const { mutateAsync: purchaseMoocMutation, isPending: purchasing } = usePurchaseMooc();

    const enrollMutation = useEnrollUser();

    const [allMoocsState, setAllMoocsState] = useState<any[]>(allMoocs?.data || []);
    useEffect(() => {
        if (allMoocs?.data) setAllMoocsState(allMoocs.data);
    }, [allMoocs]);

    if (!classId) return <p>Class ID is missing.</p>;
    if (isLoadingClass)
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <Loader2 className='w-6 h-6 animate-spin' />
            </div>
        );
    if (!classData) return <p>Class not found or invalid ID.</p>;

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

    const isUserEnrolled = (mooc: any) => {
        if (!mooc?.enrolledUsers || !userId) return false;
        return mooc.enrolledUsers.some((u: any) => {
            const uid = u.user?._id ? u.user._id : u.user;
            return uid?.toString() === userId.toString();
        });
    };

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

    const handleConfirmLeaveClass = async () => {
        if (!classId) return;
        try {
            setLeaving(true);
            await leaveClass({ classId });
        } finally {
            setLeaving(false);
            setShowLeaveConfirm(false);
        }
    };

    const handleMOOCClick = (mooc: any) => {
        const enrolled = isUserEnrolled(mooc);

        if (isOwner) {
            navigate(`/class/${classData._id}/mooc/${mooc._id}`);
            return;
        }

        if (mooc.isPaid && !enrolled) {
            setPaymentPopup({ open: true, mooc });
            return;
        }

        if (mooc.locked && !enrolled) {
            getToast('info', 'Please complete previous MOOC to unlock this one.');
            return;
        }

        navigate(`/class/${classData._id}/mooc/${mooc._id}`);
    };

    const filteredMoocs = allMoocsState.filter((mooc) => isOwner || mooc.publicStatus === 2) || [];
    const paginatedMoocs = filteredMoocs.slice(0, moocPage * moocsPerPage);
    const hasMoreMoocs = paginatedMoocs.length < filteredMoocs.length;

    const getMoocProgressForUser = (mooc: any) => {
        if (!userId || !mooc?.enrolledUsers?.length || !mooc?.decks?.length) return 0;
        const enrolledUser = mooc.enrolledUsers.find((u: any) => {
            const uid = u.user?._id ? u.user._id : u.user;
            return uid?.toString() === userId.toString();
        });
        if (!enrolledUser) return 0;

        const totalDecks = mooc.decks.length;
        const completedDecks = enrolledUser.deckProgress?.filter((d: any) => d.completed).length || 0;

        return Math.round((completedDecks / totalDecks) * 100);
    };

    return (
        <div className='min-h-screen bg-transparent'>
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
                    <div className='flex items-center gap-2'>
                        {isOwner && (
                            <Link to={`/class/${classData._id}/management`}>
                                <Button variant='default' size='default' className='flex items-center gap-2'>
                                    <Settings2 className='h-4 w-4' /> Manage Class
                                </Button>
                            </Link>
                        )}
                        {!isOwner && (
                            <Button
                                variant='destructive'
                                size='default'
                                className='flex items-center gap-2'
                                onClick={() => setShowLeaveConfirm(true)}
                                disabled={leaving}
                            >
                                {leaving ? 'Processing...' : 'Leave Classs'}
                            </Button>
                        )}
                    </div>
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
                                const enrolled = isUserEnrolled(mooc);
                                const progressPercent = getMoocProgressForUser(mooc);

                                let status: 'available' | 'locked' | 'paid' = 'available';
                                if (!enrolled && mooc.isPaid) status = 'paid';
                                else if (!enrolled && mooc.locked) status = 'locked';

                                return (
                                    <ProgressCard
                                        key={mooc._id}
                                        title={mooc.title}
                                        description={mooc.description || 'No description'}
                                        progress={progressPercent}
                                        status={status}
                                        onClick={() => handleMOOCClick(mooc)}
                                        isOwner={isOwner}
                                        isEnrolled={enrolled}
                                        onEnroll={() => {
                                            if (!userId) {
                                                getToast('error', 'You must be logged in to enroll');
                                                return;
                                            }

                                            enrollMutation.mutate(
                                                { moocId: mooc._id, userId },
                                                {
                                                    onSuccess: (data) => {
                                                        // <-- nhận data từ mutation
                                                        if (data.success) {
                                                            getToast(
                                                                'success',
                                                                data.message || 'Enrolled successfully'
                                                            );

                                                            // update local state ngay lập tức
                                                            setAllMoocsState((prev) =>
                                                                prev.map((m) =>
                                                                    m._id === mooc._id
                                                                        ? {
                                                                              ...m,
                                                                              locked: false,
                                                                              enrolledUsers: m.enrolledUsers?.some(
                                                                                  (u: any) => u.user === userId
                                                                              )
                                                                                  ? m.enrolledUsers
                                                                                  : [
                                                                                        ...(m.enrolledUsers || []),
                                                                                        {
                                                                                            user: userId,
                                                                                            deckProgress: []
                                                                                        }
                                                                                    ]
                                                                          }
                                                                        : m
                                                                )
                                                            );

                                                            navigate(`/class/${classId}/mooc/${mooc._id}`);
                                                        } else {
                                                            getToast('error', data.message || 'Enroll failed');
                                                        }
                                                    },
                                                    onError: (err) => {
                                                        const msg =
                                                            (err?.response?.data as any)?.message ||
                                                            err?.message ||
                                                            'Enroll failed';
                                                        getToast('error', msg);
                                                    }
                                                }
                                            );
                                        }}
                                    />
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
            <ConfirmLeaveClassModal
                open={showLeaveConfirm}
                onClose={() => setShowLeaveConfirm(false)}
                onConfirm={handleConfirmLeaveClass}
                isSubmitting={leaving}
                classTitle={classData.name}
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
                                disabled={purchasing}
                                onClick={async () => {
                                    try {
                                        const res = await purchaseMoocMutation({ moocId: paymentPopup.mooc._id }).then(
                                            (res) => res
                                        );

                                        if (res.success) {
                                            setPaymentPopup({ open: false, mooc: undefined });
                                            if (!auth.user) return;
                                            auth.setUser({
                                                ...auth.user,
                                                balance: auth.user.balance - paymentPopup.mooc.price
                                            });

                                            navigate(`/class/${classId}/mooc/${paymentPopup.mooc._id}`);
                                        }
                                    } catch (err) {
                                        console.error('Purchase error:', err);
                                    }
                                }}
                            >
                                {purchasing ? 'Processing...' : 'Pay Now'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}

export default ClassDetailUser;
