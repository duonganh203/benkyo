import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Plus,
    Trash2,
    Edit,
    GraduationCap,
    MoreHorizontal,
    Calendar,
    Book,
    RefreshCcw,
    AlertCircle,
    NotebookPen,
    Earth,
    Copy
} from 'lucide-react';
import { formatDistanceToNow, isBefore } from 'date-fns';
import useGetDeckById from '@/hooks/queries/use-get-deck-id';
import useGetDeckCards from '@/hooks/queries/use-get-deck-cards';
import { CardInterface, State } from '@/types/card';
import useDeleteCard from '@/hooks/queries/use-delete-card';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '../components/ui/dropdown-menu';
import { Skeleton } from '../components/ui/skeleton';
import { getToast } from '@/utils/getToast';
import useDeleteDeck from '@/hooks/queries/use-delete-deck';
import useDuplicateDeck from '@/hooks/queries/use-duplicate-deck';
import { useGenerateQuizModal } from '@/hooks/stores/use-generate-quiz-modal';
import { useSendRequestPublicDeckModal } from '@/hooks/stores/use-send-request-public-deck-modal';
import useMe from '@/hooks/queries/use-me';

import { DeckFSRSSettingsForm } from '@/components/forms/deck-fsrs-settings-form';
import { UpdateDeckModal } from '@/components/modals/update-deck-modal';
import { useUpdateDeckModal } from '@/hooks/stores/use-update-deck-modal';
import { DeckInterface, DeckDetails } from '@/types/deck';
import ConfirmDeleteCardModal from '@/components/modals/confirm-delete-card-modals';
import { useDeleteCardModal } from '@/hooks/stores/use-delete-card-modal';
import LikeDeck from '@/components/rating-deck';
import useToggleLikeDeck from '@/hooks/queries/use-toggle-like-deck';
import DeckStatistics from '@/components/deck-statistics';
import { FacebookShareButton, FacebookIcon, TwitterShareButton, TwitterIcon } from 'react-share';
import FlashcardViewer from '@/components/flashcard-view';
const DeckDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: currentUser } = useMe();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState('cards');
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const { open } = useGenerateQuizModal((store) => store);
    const updateDeckModal = useUpdateDeckModal();
    const deleteCardModal = useDeleteCardModal();
    const publicStatus = [
        {
            label: 'Private',
            color: 'text-orange-500 border-orange-500'
        },
        {
            label: 'Pending',
            color: 'text-yellow-500 border-yellow-500'
        },
        {
            label: 'Public',
            color: 'text-green-500 border-green-500'
        },
        {
            label: 'Rejected',
            color: 'text-red-500 border-red-500'
        }
    ];

    const { open: openSendReqPublicModal } = useSendRequestPublicDeckModal((store) => store);

    const { data: deckData, isLoading: isDeckLoading } = useGetDeckById(id!);
    const { data: cardsData, isLoading: isCardsLoading } = useGetDeckCards(id!);
    const { mutateAsync: deleteCardMutate } = useDeleteCard();
    const { mutateAsync: deleteDeckMutate, isPending: isDeletingDeck } = useDeleteDeck(id!);
    const { mutateAsync: duplicateDeck, isPending: isDuplicating } = useDuplicateDeck(id!);

    const queryClient = useQueryClient();

    const allTags = useMemo(() => {
        if (!cardsData) return [];
        const tagsSet = new Set<string>();

        cardsData.forEach((card) => {
            card.tags.forEach((tag: string) => tagsSet.add(tag));
        });

        return Array.from(tagsSet);
    }, [cardsData]);

    const filteredCards = useMemo(() => {
        if (!cardsData) return [];

        return cardsData.filter((card) => {
            const matchesSearch =
                searchTerm === '' ||
                card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
                card.back.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesTags = selectedTags.length === 0 || selectedTags.every((tag) => card.tags.includes(tag));

            return matchesSearch && matchesTags;
        });
    }, [cardsData, searchTerm, selectedTags]);

    const cardStats = useMemo(() => {
        if (!filteredCards.length) return { new: 0, learning: 0, review: 0, relearning: 0, dueToday: 0 };

        const now = new Date();
        now.setMinutes(now.getMinutes() + 1);
        const counts = filteredCards.reduce(
            (acc, card) => {
                if (card.learning.state === State.NEW) acc.new++;
                if (card.learning.state === State.LEARNING) acc.learning++;
                if (card.learning.state === State.REVIEW) acc.review++;
                if (card.learning.state === State.RELEARNING) acc.relearning++;

                const dueDate = new Date(card.learning.due);
                if (isBefore(dueDate, now)) {
                    acc.dueToday++;
                }

                return acc;
            },
            { new: 0, learning: 0, review: 0, relearning: 0, dueToday: 0 }
        );

        return counts;
    }, [filteredCards]);

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
    };

    const getLearningStatus = (card: CardInterface) => {
        if (!card.learning) {
            return {
                stateText: 'New',
                stateColor: 'bg-blue-500',
                dueText: 'Not scheduled',
                isDue: false
            };
        }

        const { state, due } = card.learning;
        const dueDate = new Date(due);
        const now = new Date();
        now.setMinutes(now.getMinutes() + 1);
        const isDue = isBefore(dueDate, now);

        let stateText = '';
        let stateColor = '';

        switch (state) {
            case State.NEW:
                stateText = 'New';
                stateColor = 'bg-blue-500';
                break;
            case State.LEARNING:
                stateText = 'Learning';
                stateColor = 'bg-yellow-500';
                break;
            case State.REVIEW:
                stateText = isDue ? 'Due now' : 'Review';
                stateColor = isDue ? 'bg-green-500' : 'bg-green-300';
                break;
            case State.RELEARNING:
                stateText = 'Relearning';
                stateColor = 'bg-red-500';
                break;
            default:
                stateText = 'New';
                stateColor = 'bg-blue-500';
                break;
        }

        const dueText = isDue ? 'Due now' : formatDistanceToNow(dueDate, { addSuffix: true });

        return { stateText, stateColor, dueText, isDue };
    };
    const handleDelete = (cardId: string) => {
        deleteCardMutate(
            { cardId },
            {
                onSuccess: () => {
                    getToast('success', 'Card deleted successfully');
                    queryClient.invalidateQueries({ queryKey: ['deckCards', id] });
                },
                onError: (error) => getToast('error', error!.response!.data.message)
            }
        );
    };
    const handleDeleteDeck = async () => {
        await deleteDeckMutate(
            { deckId: id! },
            {
                onSuccess: () => {
                    setConfirmDelete(false);
                    getToast('success', 'Deck deleted successfully');
                    navigate('/my-decks');
                },
                onError: (error) => {
                    getToast('error', error?.response?.data?.message || 'Failed to delete deck');
                }
            }
        );
    };
    const handleOpenUpdateModal = (deckData: DeckDetails) => {
        const deckToUpdate: DeckInterface = {
            _id: deckData._id,
            name: deckData.name,
            description: deckData.description || '',
            cardCount: deckData.fsrsParams?.card_limit || 0,
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            isPublic: deckData.publicStatus === 1,
            owner: deckData.owner,
            likeCount: deckData.likeCount ?? 0,
            liked: deckData.liked ?? false
        };

        updateDeckModal.open(deckToUpdate);
    };

    const handleDuplicateDeck = async () => {
        try {
            await duplicateDeck({ deckId: id! });
            getToast('success', 'Deck duplicated successfully!');
        } catch (error) {
            getToast('error', `${error}`);
        }
    };
    const toggleLikeMutation = useToggleLikeDeck(id!);
    const handleLike = async () => {
        try {
            const res = await toggleLikeMutation.mutateAsync();
            getToast('success', res.liked ? 'You liked this deck!' : 'You unliked this deck!');
        } catch (err) {
            getToast('error', 'Failed to update like!');
            console.error('Failed to update like:', err);
        }
    };

    const shareUrl = useMemo(() => `${window.location.origin}/deck/${id}3`, [id]);
    const shareTitle = 'Join me in learning this deck! \n' + deckData?.name + '\n' + shareUrl;

    if (isDeckLoading) {
        return (
            <div className='container max-w-5xl mx-auto py-8 px-4'>
                <div className='flex items-center gap-2 mb-8'>
                    <Skeleton className='h-10 w-10 rounded-full animate-pulse' />
                    <Skeleton className='h-8 w-64 animate-pulse animation-delay-100' />
                </div>
                <Skeleton className='h-40 w-full mb-8 animate-pulse animation-delay-200' />
                <Skeleton className='h-8 w-32 mb-4 animate-pulse animation-delay-300' />
                <div className='grid gap-4'>
                    <Skeleton className='h-24 w-full animate-pulse animation-delay-400' />
                    <Skeleton className='h-24 w-full animate-pulse animation-delay-500' />
                    <Skeleton className='h-24 w-full animate-pulse animation-delay-600' />
                </div>
            </div>
        );
    }

    return (
        <>
            {!deckData ? (
                <div className='max-w-5xl mx-auto py-8 px-4 text-center animate-fade-in'>
                    <h1 className='text-2xl font-bold mb-4'>Deck not found</h1>
                    <p className='mb-4'>The deck you're looking for doesn't exist or you don't have access to it.</p>
                    <Button onClick={() => navigate('/home')} className='animate-slide-up'>
                        Back to Home
                    </Button>
                </div>
            ) : (
                <div className='max-w-5xl mx-auto py-8 px-4 animate-fade-in'>
                    <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-slide-down'>
                        <div className='flex items-center gap-2'>
                            <Button
                                variant='outline'
                                size='icon'
                                onClick={() => {
                                    if (deckData.publicStatus === 2) {
                                        navigate('/community');
                                    } else {
                                        navigate('/my-decks');
                                    }
                                }}
                                className='transition-transform'
                            >
                                <ChevronLeft className='h-5 w-5' />
                            </Button>

                            <div>
                                <h1 className='text-2xl font-bold'>{deckData.name}</h1>
                                <p className='text-muted-foreground'>{deckData.description || 'No description'}</p>
                                <div className='flex items-center gap-3 mt-2'>
                                    <LikeDeck deckData={deckData} currentUser={currentUser} onLikeApi={handleLike} />
                                    {deckData.publicStatus === 2 && (
                                        <div className='flex items-center gap-2'>
                                            <FacebookShareButton
                                                url={shareUrl}
                                                title={shareTitle}
                                                hashtag={shareTitle}
                                                className='inline-flex items-center justify-center'
                                            >
                                                <FacebookIcon size={32} round />
                                            </FacebookShareButton>
                                            <TwitterShareButton
                                                url={shareUrl}
                                                title={shareTitle}
                                                className='inline-flex items-center justify-center'
                                            >
                                                <TwitterIcon size={32} round />
                                            </TwitterShareButton>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Badge
                                variant='outline'
                                className={`ml-2 text-white text-xs flex items-center px-2 ${publicStatus[deckData.publicStatus].color} border-1}`}
                            >
                                {publicStatus[deckData.publicStatus].label}
                                <Earth
                                    className={`h-4 w-4 ml-0.5 inline-block ${publicStatus[deckData.publicStatus].color}`}
                                />
                            </Badge>
                        </div>

                        <div className='flex items-center gap-2'>
                            {currentUser && deckData.owner._id === currentUser._id && (
                                <>
                                    <Button onClick={() => navigate(`/study/${id}`)} className='transition-transform'>
                                        <GraduationCap className='mr-2 h-5 w-5' />
                                        Study Now
                                    </Button>

                                    <Button
                                        onClick={() => open(id!)}
                                        className='transition-transform hover:bg-blue-500 hover:text-white'
                                        variant='outline'
                                    >
                                        <NotebookPen className='mr-2 h-5 w-5' />
                                        Do Quiz
                                    </Button>

                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openSendReqPublicModal(id!);
                                        }}
                                        variant='outline'
                                        size='sm'
                                        className='px-3 py-2 h-auto text-primary hover:text-primary hover:bg-primary/10'
                                    >
                                        <Earth className='h-8 w-8' />
                                    </Button>
                                </>
                            )}
                            {currentUser && deckData.owner._id === currentUser._id && (
                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant='outline' size='icon'>
                                            <MoreHorizontal className='h-5 w-5' />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align='end'>
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenUpdateModal(deckData);
                                            }}
                                        >
                                            <Edit className='mr-2 h-4 w-4' />
                                            <span>Edit Deck</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                            {currentUser && deckData.publicStatus === 2 && deckData.owner._id !== currentUser._id && (
                                <Button
                                    variant='outline'
                                    onClick={handleDuplicateDeck}
                                    disabled={isDuplicating}
                                    title='Duplicate Deck'
                                >
                                    <Copy className='h-5 w-5' />
                                    <span>Duplicate Deck</span>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
                        <Card className='animate-scale-in hover:shadow-md transition-shadow'>
                            <CardContent className='flex flex-col items-center justify-center p-6'>
                                <div className='text-3xl font-bold animate-fade-in'>{cardStats.dueToday}</div>
                                <p className='text-muted-foreground'>Due Today</p>
                            </CardContent>
                        </Card>
                        <Card className='animate-scale-in animation-delay-100 hover:shadow-md transition-shadow'>
                            <CardContent className='flex flex-col items-center justify-center p-6'>
                                <div className='text-3xl font-bold animate-fade-in animation-delay-100'>
                                    {cardStats.new}
                                </div>
                                <p className='text-muted-foreground'>New</p>
                            </CardContent>
                        </Card>
                        <Card className='animate-scale-in animation-delay-200 hover:shadow-md transition-shadow'>
                            <CardContent className='flex flex-col items-center justify-center p-6'>
                                <div className='text-3xl font-bold animate-fade-in animation-delay-200'>
                                    {cardStats.learning + cardStats.relearning}
                                </div>
                                <p className='text-muted-foreground'>Learning</p>
                            </CardContent>
                        </Card>
                        <Card className='animate-scale-in animation-delay-300 hover:shadow-md transition-shadow'>
                            <CardContent className='flex flex-col items-center justify-center p-6'>
                                <div className='text-3xl font-bold animate-fade-in animation-delay-300'>
                                    {cardStats.review}
                                </div>
                                <p className='text-muted-foreground'>Review</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabs */}
                    <Tabs
                        defaultValue='cards'
                        className='w-full animate-fade-in animation-delay-400'
                        value={activeTab}
                        onValueChange={setActiveTab}
                    >
                        <TabsList className='mb-6'>
                            <TabsTrigger value='cards' className='transition-all'>
                                Cards
                            </TabsTrigger>

                            <TabsTrigger value='stats' className='transition-all'>
                                Statistics
                            </TabsTrigger>
                            {currentUser && deckData.owner._id === currentUser._id && (
                                <TabsTrigger value='settings' className='transition-all'>
                                    Settings
                                </TabsTrigger>
                            )}
                        </TabsList>

                        <TabsContent value='cards' className='animate-fade-in'>
                            {cardsData && cardsData.length > 0 && (
                                <div className='mb-8 animate-fade-in'>
                                    <FlashcardViewer
                                        cards={filteredCards.length > 0 ? filteredCards : cardsData}
                                        initialIndex={0}
                                        onCardChange={setCurrentCardIndex}
                                    />
                                </div>
                            )}

                            {/* Search and Add button */}
                            <div className='flex flex-col md:flex-row justify-between mb-4 gap-4 animate-slide-up'>
                                <div className='flex-1'>
                                    <Input
                                        placeholder='Search cards...'
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className='w-full transition-all focus:ring-2 focus:ring-blue-500'
                                    />
                                </div>
                                {currentUser && deckData.owner._id === currentUser._id && (
                                    <Button
                                        onClick={() => navigate(`/deck/${id}/create-card`)}
                                        className='transition-transform'
                                    >
                                        <Plus className='mr-2 h-4 w-4' />
                                        Add Card
                                    </Button>
                                )}
                            </div>

                            {allTags.length > 0 && (
                                <div className='mb-6 animate-slide-up animation-delay-100'>
                                    <h3 className='text-sm font-medium mb-2'>Filter by tags:</h3>
                                    <div className='flex flex-wrap gap-2'>
                                        {allTags.map((tag, index) => (
                                            <Badge
                                                key={tag}
                                                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                                                className={`cursor-pointer transition-transform animation-delay-${Math.min(100 * index, 900)}`}
                                                onClick={() => toggleTag(tag)}
                                            >
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Card list */}
                            {isCardsLoading ? (
                                <div className='grid gap-4'>
                                    <Skeleton className='h-24 w-full animate-pulse' />
                                    <Skeleton className='h-24 w-full animate-pulse animation-delay-100' />
                                    <Skeleton className='h-24 w-full animate-pulse animation-delay-200' />
                                </div>
                            ) : filteredCards.length === 0 ? (
                                <div className='text-center py-12 animate-fade-in'>
                                    <Book className='h-12 w-12 mx-auto text-muted-foreground mb-2 animate-bounce-small' />
                                    <h3 className='text-lg font-medium'>No cards found</h3>
                                    <p className='text-muted-foreground mb-4'>
                                        {cardsData?.length === 0
                                            ? "This deck doesn't have any cards yet."
                                            : 'No cards match your search criteria.'}
                                    </p>
                                    {cardsData?.length === 0 &&
                                        currentUser &&
                                        deckData.owner._id === currentUser._id && (
                                            <Button
                                                onClick={() => navigate(`/deck/${id}/create-card`)}
                                                className='transition-transform animate-slide-up'
                                            >
                                                <Plus className='mr-2 h-4 w-4' />
                                                Add Your First Card
                                            </Button>
                                        )}
                                </div>
                            ) : (
                                <div className='grid gap-4'>
                                    {filteredCards.map((card, index) => {
                                        const status = getLearningStatus(card);
                                        const delay = Math.min(index * 100, 900);
                                        const isCurrentCard = index === currentCardIndex;

                                        return (
                                            <Card
                                                key={card._id}
                                                className={`overflow-hidden hover:shadow-md transition-all animate-slide-up animation-delay-${delay} cursor-pointer`}
                                                onClick={() => navigate(`/flashcards/${card._id}/details`)}
                                            >
                                                <CardContent className='p-0'>
                                                    <div className='grid grid-cols-1 md:grid-cols-2'>
                                                        <div className='p-4 md:border-r'>
                                                            <div className='text-xs text-muted-foreground mb-2'>
                                                                FRONT
                                                            </div>
                                                            <div dangerouslySetInnerHTML={{ __html: card.front }} />
                                                        </div>
                                                        <div className='p-4 bg-muted/30'>
                                                            <div className='text-xs text-muted-foreground mb-2'>
                                                                BACK
                                                            </div>
                                                            <div dangerouslySetInnerHTML={{ __html: card.back }} />
                                                        </div>
                                                    </div>
                                                    <div className='p-3 bg-background/30 backdrop-blur-sm dark:bg-background/30 flex flex-wrap items-center justify-between gap-2 border-t'>
                                                        <div className='flex flex-wrap items-center gap-2'>
                                                            {card.tags.map((tag: string) => (
                                                                <Badge key={tag} variant='outline' className='text-xs'>
                                                                    {tag}
                                                                </Badge>
                                                            ))}
                                                            {card.tags.length === 0 && (
                                                                <span className='text-xs text-muted-foreground'>
                                                                    No tags
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className='flex items-center gap-4'>
                                                            {isCurrentCard && (
                                                                <Badge variant='default' className='text-xs'>
                                                                    Current
                                                                </Badge>
                                                            )}
                                                            <div className='flex items-center gap-1 text-sm'>
                                                                <div
                                                                    className={`w-2 h-2 rounded-full ${status.stateColor}`}
                                                                />
                                                                <span>{status.stateText}</span>
                                                            </div>
                                                            <div className='flex items-center text-sm text-muted-foreground'>
                                                                <Calendar className='h-3 w-3 mr-1' />
                                                                <span>{status.dueText}</span>
                                                            </div>
                                                            {currentUser && deckData.owner._id === currentUser._id && (
                                                                <DropdownMenu modal={false}>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button
                                                                            variant='ghost'
                                                                            size='sm'
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        >
                                                                            <MoreHorizontal className='h-4 w-4' />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align='end'>
                                                                        <DropdownMenuItem
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                navigate(
                                                                                    `/deck/${id}/edit-card/${card._id}`
                                                                                );
                                                                            }}
                                                                        >
                                                                            <Edit className='mr-2 h-4 w-4' />
                                                                            <span>Edit</span>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                deleteCardModal.open(card._id);
                                                                            }}
                                                                        >
                                                                            <Trash2 className='mr-2 h-4 w-4' />
                                                                            <span>Delete</span>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                getToast(
                                                                                    'success',
                                                                                    'Card progress has been reset'
                                                                                );
                                                                            }}
                                                                        >
                                                                            <RefreshCcw className='mr-2 h-4 w-4' />
                                                                            <span>Reset Progress</span>
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value='stats' className='animate-fade-in'>
                            <DeckStatistics deckId={id!} />
                        </TabsContent>

                        {currentUser && deckData.owner._id === currentUser._id && (
                            <TabsContent value='settings' className='animate-fade-in'>
                                <div className='space-y-6'>
                                    {/* FSRS Settings */}
                                    <DeckFSRSSettingsForm deck={deckData} />

                                    {/* General Settings */}
                                    <Card className='hover:shadow-md transition-shadow'>
                                        <CardContent className='p-6'>
                                            <h2 className='text-xl font-semibold mb-4'>General Settings</h2>

                                            <div className='space-y-6'>
                                                <div>
                                                    <h3 className='text-md font-medium mb-2'>Deck Information</h3>
                                                    <p className='text-muted-foreground mb-4'>
                                                        General settings coming soon. This feature is under development.
                                                    </p>
                                                </div>

                                                <div className='border-t pt-6'>
                                                    <h3 className='text-md font-medium text-destructive flex items-center mb-4'>
                                                        <Trash2 className='h-4 w-4 mr-2' />
                                                        Delete Deck
                                                    </h3>

                                                    {!isDeletingDeck ? (
                                                        <div>
                                                            <p className='text-muted-foreground mb-4'>
                                                                Deleting a deck will permanently remove it and all its
                                                                cards. This action cannot be undone.
                                                            </p>

                                                            {confirmDelete ? (
                                                                <div className='bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-4'>
                                                                    <div className='flex items-start'>
                                                                        <AlertCircle className='h-5 w-5 text-destructive mt-0.5 mr-3 flex-shrink-0' />
                                                                        <div>
                                                                            <h4 className='font-medium text-destructive'>
                                                                                Are you absolutely sure?
                                                                            </h4>
                                                                            <p className='text-sm text-muted-foreground mb-3'>
                                                                                This will delete "{deckData?.name}" and
                                                                                all {cardsData?.length || 0} cards. You
                                                                                cannot recover this data.
                                                                            </p>
                                                                            <div className='flex gap-2'>
                                                                                <Button
                                                                                    variant='destructive'
                                                                                    onClick={handleDeleteDeck}
                                                                                >
                                                                                    Yes, Delete Deck
                                                                                </Button>
                                                                                <Button
                                                                                    variant='outline'
                                                                                    onClick={() =>
                                                                                        setConfirmDelete(false)
                                                                                    }
                                                                                >
                                                                                    Cancel
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <Button
                                                                    variant='destructive'
                                                                    onClick={() => setConfirmDelete(true)}
                                                                >
                                                                    Delete Deck
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className='flex items-center gap-2'>
                                                            <Button variant='destructive' disabled>
                                                                <span className='animate-pulse'>Deleting...</span>
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>
                        )}
                    </Tabs>
                    <UpdateDeckModal />
                </div>
            )}
            <ConfirmDeleteCardModal onConfirm={handleDelete} />
        </>
    );
};

export default DeckDetail;
