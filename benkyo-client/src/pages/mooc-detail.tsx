// MOOCDetail.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, BookOpen, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import ProgressCard from '@/components/moocs-card';
import { useGetMoocDetail } from '@/hooks/queries/use-get-mooc-detail';
import useMe from '@/hooks/queries/use-me';
import ConfirmDeleteMoocModal from '@/components/modals/confirm-delete-mooc-modals';
import useDeleteMooc from '@/hooks/queries/use-delete-mooc-class';
import { getToast } from '@/utils/getToast';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface Deck {
    _id: string;
    name: string;
    description?: string;
    cardCount?: number;
    publicStatus?: number;
    locked?: boolean;
}

interface DeckWrapper {
    _id: string;
    order?: number;
    pointsRequired?: number;
    deck: Deck;
}

const MOOCDetail: React.FC = () => {
    const { classId, moocId } = useParams<{ classId: string; moocId: string }>();
    const navigate = useNavigate();
    const { data: mooc, isLoading, isError } = useGetMoocDetail(moocId!);
    const { data: user } = useMe();
    const isOwner = mooc ? user?._id === mooc.owner?._id : false;
    const { mutateAsync: deleteMooc } = useDeleteMooc();
    const [openDeleteModal, setOpenDeleteModal] = React.useState(false);

    if (isLoading) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <p className='text-lg text-muted-foreground'>Loading MOOC data...</p>
            </div>
        );
    }

    if (isError || !mooc) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <p className='text-lg text-muted-foreground'>MOOC not found</p>
            </div>
        );
    }

    const handleEdit = () => navigate(`/moocs/update/${moocId}`);
    const handleDelete = async () => {
        if (!moocId) return;
        const res = await deleteMooc(moocId);
        if (res.success) {
            getToast('success', 'MOOC deleted successfully');
            navigate(`/class/${classId}`);
        } else {
            getToast('error', 'MOOC deletion failed');
        }
    };
    const handleGoToDeck = (deckId: string) => navigate(`/class/${classId}/mooc/${moocId}/deck/${deckId}`);

    const isUserEnrolled = (mooc: any) => {
        if (!mooc?.enrolledUsers || !user?._id) return false;
        return mooc.enrolledUsers.some((u: any) => {
            const uid = u.user?._id ? u.user._id : u.user;
            return uid?.toString() === user._id.toString();
        });
    };

    const getDeckProgressForUser = (deckId: string) => {
        if (!mooc || !user?._id) return null;
        const enrolledUser = mooc.enrolledUsers.find((u: any) => {
            const uid = u.user?._id ? u.user._id : u.user;
            return uid?.toString() === user._id.toString();
        });
        if (!enrolledUser) return null;
        return enrolledUser.deckProgress.find((d: any) => {
            const did = d.deck?._id ? d.deck._id : d.deck;
            return did?.toString() === deckId.toString();
        });
    };

    const getDeckStatusForUser = (deckId: string) => {
        if (isOwner) return 'available';
        if (!isUserEnrolled(mooc)) return 'locked';
        const progress = getDeckProgressForUser(deckId);
        if (!progress) return 'locked';
        return progress.locked ? 'locked' : 'available';
    };

    const isMoocCompletedByUser = () => {
        if (isOwner) return true;
        if (!mooc || !user?._id) return false;
        const enrolledUser = mooc.enrolledUsers.find((u: any) => {
            const uid = u.user?._id ? u.user._id : u.user;
            return uid?.toString() === user._id.toString();
        });
        if (!enrolledUser) return false;
        return enrolledUser.deckProgress.every((d: any) => d.completed);
    };

    return (
        <div className='min-h-screen bg-background'>
            <header className='bg-card border-b border-border py-6 px-4'>
                <div className='max-w-4xl mx-auto flex items-start justify-between'>
                    <div className='flex items-center gap-4'>
                        <button
                            onClick={() => navigate(`/class/${classId}`)}
                            className='p-2 rounded-md hover:bg-accent transition-colors'
                        >
                            <ArrowLeft className='w-5 h-5 text-foreground cursor-pointer' />
                        </button>

                        <div className='p-3 bg-primary/10 rounded-xl flex items-center justify-center'>
                            <BookOpen className='w-7 h-7 text-primary' />
                        </div>

                        <div className='flex flex-col'>
                            <h1 className='text-2xl font-bold text-foreground leading-tight'>{mooc.title}</h1>
                            <p className='text-base text-muted-foreground leading-snug'>{mooc.description}</p>
                        </div>
                    </div>

                    {isOwner && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant='ghost' size='icon'>
                                    <MoreVertical className='h-5 w-5' />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end' className='w-32'>
                                <DropdownMenuItem onClick={handleEdit}>
                                    <Pencil className='mr-2 h-4 w-4' /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setOpenDeleteModal(true)} className='text-destructive'>
                                    <Trash2 className='mr-2 h-4 w-4' /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </header>

            <section className='py-8 px-4'>
                <div className='max-w-4xl mx-auto'>
                    <div className='mb-8'>
                        <h2 className='text-2xl font-bold text-foreground mb-2'>Learning Decks</h2>
                        <p className='text-muted-foreground'>
                            Master each deck through flashcard study, then take a test to move forward.
                        </p>
                    </div>

                    <div className='grid grid-cols-1 gap-6'>
                        {Array.isArray(mooc.decks) && mooc.decks.length > 0 ? (
                            mooc.decks
                                .sort((a: DeckWrapper, b: DeckWrapper) => (a.order ?? 0) - (b.order ?? 0))
                                .map((deckWrapper: DeckWrapper) => {
                                    if (!deckWrapper || !deckWrapper.deck) return null;
                                    const deck = deckWrapper.deck;

                                    // Lấy progress của user cho deck này
                                    let progress = 0;
                                    if (!isOwner && user?._id) {
                                        const enrolledUser = mooc.enrolledUsers.find((u: any) => {
                                            const uid = u.user?._id ? u.user._id : u.user;
                                            return uid?.toString() === user._id.toString();
                                        });
                                        if (enrolledUser) {
                                            const deckProg = enrolledUser.deckProgress.find((d: any) => {
                                                const did = d.deck?._id ? d.deck._id : d.deck;
                                                return did?.toString() === deck._id.toString();
                                            });
                                            if (deckProg) progress = deckProg.progress ?? 0;
                                        }
                                    }

                                    const deckStatus = getDeckStatusForUser(deck._id);
                                    const isAvailable = deckStatus === 'available';

                                    return (
                                        <div key={deck._id} className='space-y-3'>
                                            <ProgressCard
                                                title={deck.name ?? 'Untitled Deck'}
                                                description={`${deck.description ?? ''} • ${deck.cardCount ?? 0} flashcards • ${deckWrapper.pointsRequired ?? 0} points required`}
                                                progress={progress}
                                                status={deckStatus}
                                                onClick={() => isAvailable && handleGoToDeck(deck._id)}
                                            />
                                        </div>
                                    );
                                })
                        ) : (
                            <Card className='shadow-card'>
                                <CardContent className='p-8 text-center'>
                                    <BookOpen className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
                                    <h3 className='text-lg font-semibold text-foreground mb-2'>Coming Soon</h3>
                                    <p className='text-muted-foreground'>
                                        The decks for this MOOC are currently being prepared.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {isMoocCompletedByUser() && mooc.nextMoocId && (
                        <Button onClick={() => navigate(`/class/${classId}/mooc/${mooc.nextMoocId}`)}>
                            Go to Next MOOC
                        </Button>
                    )}
                </div>
            </section>

            <ConfirmDeleteMoocModal
                open={openDeleteModal}
                onClose={() => setOpenDeleteModal(false)}
                onConfirm={handleDelete}
            />
        </div>
    );
};

export default MOOCDetail;
