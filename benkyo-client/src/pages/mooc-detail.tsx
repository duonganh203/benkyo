import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Zap, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import ProgressCard from '@/components/moocs-card';
import { useGetMoocDetail } from '@/hooks/queries/use-get-mooc-detail';
import useMe from '@/hooks/queries/use-me';
import ConfirmDeleteMoocModal from '@/components/modals/confirm-delete-mooc-modals';
import useDeleteMooc from '@//hooks/queries/use-delete-mooc-class';
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

    const handleEdit = () => {
        navigate(`/moocs/update/${moocId}`);
    };

    const handleDelete = async () => {
        if (!moocId) return;
        const res = await deleteMooc(moocId);
        if (res.success) {
            getToast('success', 'MOOC deleted successfully');
            navigate(`/class/${classId}`);
        } else {
            getToast('error', 'MOOC deleted failure');
        }
    };

    const handleGoToDeck = (deckId: string) => {
        navigate(`/class/${classId}/mooc/${moocId}/deck/${deckId}`);
    };

    const handleQuizHub = (deckId: string) => {
        navigate(`/class/${classId}/mooc/${moocId}/deck/${deckId}/quiz-hub`);
    };

    return (
        <div className='min-h-screen bg-background'>
            {/* Header */}
            <header className='bg-card border-b border-border py-6 px-4'>
                <div className='max-w-4xl mx-auto flex items-start justify-between'>
                    <div className='flex items-start gap-4'>
                        <div className='p-3 bg-primary/10 rounded-lg'>
                            <BookOpen className='w-8 h-8 text-primary' />
                        </div>
                        <div>
                            <h1 className='text-3xl font-bold text-foreground mb-2'>{mooc.title}</h1>
                            <p className='text-lg text-muted-foreground'>{mooc.description}</p>
                        </div>
                    </div>

                    {isOwner && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    className='text-muted-foreground hover:text-foreground'
                                >
                                    <MoreVertical className='h-5 w-5' />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align='end' className='w-32'>
                                <DropdownMenuItem onClick={handleEdit}>
                                    <Pencil className='mr-2 h-4 w-4' />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setOpenDeleteModal(true)}
                                    className='text-destructive focus:text-destructive'
                                >
                                    <Trash2 className='mr-2 h-4 w-4' />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </header>

            {/* Decks Section */}
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
                                .map((deckWrapper: DeckWrapper, idx: number) => {
                                    if (!deckWrapper || !deckWrapper.deck) return null;
                                    const deck = deckWrapper.deck;
                                    console.log('Deck object:', deck);
                                    console.log(`Deck ${idx} id: ${deck._id}, locked:`, deck.locked);
                                    const deckStatus = deck.locked === true ? 'locked' : 'available';
                                    const isAvailable = deckStatus === 'available';

                                    return (
                                        <div key={deck._id} className='space-y-3'>
                                            <ProgressCard
                                                title={deck.name ?? 'Untitled Deck'}
                                                description={`${deck.description ?? ''} • ${deck.cardCount ?? 0} flashcards • ${deckWrapper.pointsRequired ?? 0} points required`}
                                                progress={0}
                                                status={deckStatus}
                                                onClick={() => isAvailable && handleGoToDeck(deck._id)}
                                            />
                                            {isAvailable && (
                                                <div className='flex justify-end'>
                                                    <Button
                                                        variant='outline'
                                                        size='sm'
                                                        onClick={() => handleQuizHub(deck._id)}
                                                        className='flex items-center gap-2'
                                                    >
                                                        <Zap className='w-4 h-4' />
                                                        Extra Challenge
                                                    </Button>
                                                </div>
                                            )}
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
