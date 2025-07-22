import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, Settings2 } from 'lucide-react';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import useAuthStore from '@/hooks/stores/use-auth-store';
import { DeckInClass } from '@/components/deck-card';
import useGetClassUserById from '@/hooks/queries/use-get-class-user-id';
import ClassHeader from '@/components/class-header';
import DeckCard from '@/components/deck-card';
import TopLearners from '@/components/top-learners';
import StatsGrid from '@/components/stats-grid';

function ClassDetailUser() {
    const { user } = useAuthStore();
    const { classId } = useParams<{ classId: string }>();
    const [isExpanded, setIsExpanded] = useState(false);
    const [studyingDeck, setStudyingDeck] = useState<DeckInClass | null>(null);

    const { data: classData, isLoading: isLoadingClass } = useGetClassUserById(classId ?? '');

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
    const allDecksRaw = classData.decks?.flatMap((group: any) => group.decks || []) || [];
    const totalDecksCount = allDecksRaw.length;

    const topLearners =
        classData.userClassStates
            ?.map((ucs: any) => ({
                id: ucs.user._id,
                name: ucs.user.name,
                avatar: ucs.user.avatar,
                points: ucs.points,
                streak: ucs.studyStreak || 0
            }))
            .sort((a: any, b: any) => b.points - a.points)
            .slice(0, 5) || [];

    const allDecks = allDecksRaw.filter((deck, index, self) => self.findIndex((d) => d._id === deck._id) === index);

    const scheduledDecks = allDecks.filter((deck: any) => deck.startTime && deck.endTime);
    const moreDecks = allDecks.filter((deck: any) => !deck.startTime || !deck.endTime);

    const startStudyMode = (deck: DeckInClass) => setStudyingDeck(deck);
    const closeStudyDialog = () => setStudyingDeck(null);

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
                            completionRate: classData.completionRate
                        }}
                        isExpanded={isExpanded}
                        onToggleExpanded={() => setIsExpanded(!isExpanded)}
                        totalLearnersCount={totalLearnersCount}
                        totalDecksCount={totalDecksCount}
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
                        completionRate={classData.completionRate || 0}
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
                                            deck={deck}
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
                                            deck={deck}
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
                <DialogContent className='max-w-4xl w-[90vw] h-[90vh] p-0 border-0 z-50'>
                    {studyingDeck && (
                        <iframe
                            src={`/study/${studyingDeck._id}?view=iframe`}
                            className='w-full h-full border-0'
                            title={`Study: ${studyingDeck.name}`}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default ClassDetailUser;
