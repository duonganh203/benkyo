import { toast } from 'sonner';
import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Plus,
    Trash2,
    Edit,
    GraduationCap,
    MoreHorizontal,
    ExternalLink,
    Calendar,
    Book,
    RefreshCcw
} from 'lucide-react';
import { formatDistanceToNow, isBefore } from 'date-fns';
import useGetDeckById from '@/hooks/queries/use-get-deck-id';
import useGetDeckCards from '@/hooks/queries/use-get-deck-cards';
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
import { CardInterface, State } from '@/types/card';

const DeckDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState('cards');

    const { data: deckData, isLoading: isDeckLoading } = useGetDeckById(id!);
    const { data: cardsData, isLoading: isCardsLoading } = useGetDeckCards(id!);

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
        const { state, due } = card.learning;
        const dueDate = new Date(due);
        const now = new Date();
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
                stateText = 'Review';
                stateColor = isDue ? 'bg-green-500' : 'bg-green-300';
                break;
            case State.RELEARNING:
                stateText = 'Relearning';
                stateColor = 'bg-red-500';
                break;
        }

        const dueText = isDue ? 'Due now' : formatDistanceToNow(dueDate, { addSuffix: true });

        return { stateText, stateColor, dueText, isDue };
    };

    if (isDeckLoading) {
        return (
            <div className='container max-w-5xl mx-auto py-8 px-4'>
                <div className='flex items-center gap-2 mb-8'>
                    <Skeleton className='h-10 w-10 rounded-full' />
                    <Skeleton className='h-8 w-64' />
                </div>
                <Skeleton className='h-40 w-full mb-8' />
                <Skeleton className='h-8 w-32 mb-4' />
                <div className='grid gap-4'>
                    <Skeleton className='h-24 w-full' />
                    <Skeleton className='h-24 w-full' />
                    <Skeleton className='h-24 w-full' />
                </div>
            </div>
        );
    }

    return (
        <>
            {!deckData ? (
                <div className='max-w-5xl mx-auto py-8 px-4 text-center'>
                    <h1 className='text-2xl font-bold mb-4'>Deck not found</h1>
                    <p className='mb-4'>The deck you're looking for doesn't exist or you don't have access to it.</p>
                    <Button onClick={() => navigate('/home')}>Back to Home</Button>
                </div>
            ) : (
                <div className=' max-w-5xl mx-auto py-8 px-4'>
                    <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8'>
                        <div className='flex items-center gap-2'>
                            <Button variant='outline' size='icon' onClick={() => navigate('/home')}>
                                <ChevronLeft className='h-5 w-5' />
                            </Button>
                            <div>
                                <h1 className='text-2xl font-bold'>{deckData.name}</h1>
                                <p className='text-muted-foreground'>{deckData.description || 'No description'}</p>
                            </div>
                        </div>

                        <div className='flex items-center gap-2'>
                            <Button onClick={() => navigate(`/study/${id}`)}>
                                <GraduationCap className='mr-2 h-5 w-5' />
                                Study Now
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant='outline' size='icon'>
                                        <MoreHorizontal className='h-5 w-5' />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end'>
                                    <DropdownMenuItem>
                                        <Edit className='mr-2 h-4 w-4' />
                                        <span>Edit Deck</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <ExternalLink className='mr-2 h-4 w-4' />
                                        <span>Share Deck</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className='text-destructive'>
                                        <Trash2 className='mr-2 h-4 w-4' />
                                        <span>Delete Deck</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
                        <Card>
                            <CardContent className='flex flex-col items-center justify-center p-6'>
                                <div className='text-3xl font-bold'>{cardStats.dueToday}</div>
                                <p className='text-muted-foreground'>Due Today</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className='flex flex-col items-center justify-center p-6'>
                                <div className='text-3xl font-bold'>{cardStats.new}</div>
                                <p className='text-muted-foreground'>New</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className='flex flex-col items-center justify-center p-6'>
                                <div className='text-3xl font-bold'>{cardStats.learning + cardStats.relearning}</div>
                                <p className='text-muted-foreground'>Learning</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className='flex flex-col items-center justify-center p-6'>
                                <div className='text-3xl font-bold'>{cardStats.review}</div>
                                <p className='text-muted-foreground'>Review</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue='cards' className='w-full' value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className='mb-6'>
                            <TabsTrigger value='cards'>Cards</TabsTrigger>
                            <TabsTrigger value='stats'>Statistics</TabsTrigger>
                            <TabsTrigger value='settings'>Settings</TabsTrigger>
                        </TabsList>

                        <TabsContent value='cards'>
                            <div className='flex flex-col md:flex-row justify-between mb-4 gap-4'>
                                <div className='flex-1'>
                                    <Input
                                        placeholder='Search cards...'
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className='w-full'
                                    />
                                </div>
                                <Button onClick={() => navigate(`/deck/${id}/create-card`)}>
                                    <Plus className='mr-2 h-4 w-4' />
                                    Add Card
                                </Button>
                            </div>

                            {allTags.length > 0 && (
                                <div className='mb-6'>
                                    <h3 className='text-sm font-medium mb-2'>Filter by tags:</h3>
                                    <div className='flex flex-wrap gap-2'>
                                        {allTags.map((tag) => (
                                            <Badge
                                                key={tag}
                                                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                                                className='cursor-pointer'
                                                onClick={() => toggleTag(tag)}
                                            >
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {isCardsLoading ? (
                                <div className='grid gap-4'>
                                    <Skeleton className='h-24 w-full' />
                                    <Skeleton className='h-24 w-full' />
                                    <Skeleton className='h-24 w-full' />
                                </div>
                            ) : filteredCards.length === 0 ? (
                                <div className='text-center py-12'>
                                    <Book className='h-12 w-12 mx-auto text-muted-foreground mb-2' />
                                    <h3 className='text-lg font-medium'>No cards found</h3>
                                    <p className='text-muted-foreground mb-4'>
                                        {cardsData?.length === 0
                                            ? "This deck doesn't have any cards yet."
                                            : 'No cards match your search criteria.'}
                                    </p>
                                    {cardsData?.length === 0 && (
                                        <Button onClick={() => navigate(`/deck/${id}/create-card`)}>
                                            <Plus className='mr-2 h-4 w-4' />
                                            Add Your First Card
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className='grid gap-4'>
                                    {filteredCards.map((card) => {
                                        const status = getLearningStatus(card);

                                        return (
                                            <Card key={card._id} className='overflow-hidden'>
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
                                                    <div className='p-3 bg-background flex flex-wrap items-center justify-between gap-2 border-t'>
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
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant='ghost' size='sm'>
                                                                        <MoreHorizontal className='h-4 w-4' />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align='end'>
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            navigate(
                                                                                `/deck/${id}/edit-card/${card._id}`
                                                                            )
                                                                        }
                                                                    >
                                                                        <Edit className='mr-2 h-4 w-4' />
                                                                        <span>Edit</span>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            console.log('Delete');
                                                                        }}
                                                                    >
                                                                        <Trash2 className='mr-2 h-4 w-4' />
                                                                        <span>Delete</span>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            toast.success(
                                                                                'Card progress has been reset'
                                                                            );
                                                                        }}
                                                                    >
                                                                        <RefreshCcw className='mr-2 h-4 w-4' />
                                                                        <span>Reset Progress</span>
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value='stats'>
                            <Card>
                                <CardContent className='p-6'>
                                    <h2 className='text-xl font-semibold mb-4'>Deck Statistics</h2>
                                    <p className='text-muted-foreground'>
                                        Statistics coming soon. This feature is under development.
                                    </p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value='settings'>
                            <Card>
                                <CardContent className='p-6'>
                                    <h2 className='text-xl font-semibold mb-4'>Deck Settings</h2>
                                    <p className='text-muted-foreground'>
                                        Deck settings coming soon. This feature is under development.
                                    </p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </>
    );
};

export default DeckDetail;
