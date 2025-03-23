import { useState } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Book, Plus, Search, Clock, GraduationCap, Earth } from 'lucide-react';

import { DeckInterface } from '@/types/deck';
import useGetUserDecks from '@/hooks/queries/use-get-user-decks';
import { useCreateDeckModal } from '@/hooks/stores/use-create-deck-modal';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

const Library = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const { open } = useCreateDeckModal((store) => store);

    const { data: decks = [], isLoading } = useGetUserDecks();

    const filteredDecks = decks.filter(
        (deck: DeckInterface) =>
            deck.name.toLowerCase().includes(search.toLowerCase()) ||
            deck.description?.toLowerCase().includes(search.toLowerCase())
    );

    const handleDeckClick = (deckId: string) => {
        navigate(`/deck/${deckId}`);
    };

    return (
        <div className='max-w-7xl mx-auto py-8 px-4'>
            <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8'>
                <h1 className='text-3xl font-bold flex items-center gap-2 text-foreground'>
                    <Book className='h-8 w-8 text-primary' />
                    My Library
                </h1>

                <div className='flex w-full md:w-auto gap-2 mt-2 md:mt-0'>
                    <div className='relative w-full md:w-64'>
                        <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                        <Input
                            placeholder='Search decks...'
                            className='pl-8'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button onClick={open}>
                        <Plus className='h-4 w-4 mr-2' />
                        Create Deck
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                    {Array(16)
                        .fill(0)
                        .map((_, i) => (
                            <Card key={i} className='overflow-hidden h-64'>
                                <Skeleton className='h-full w-full' />
                            </Card>
                        ))}
                </div>
            ) : filteredDecks.length === 0 ? (
                <div className='text-center py-16'>
                    <div className='mb-4 flex justify-center'>
                        <Book className='h-16 w-16 text-primary/60' />
                    </div>
                    <h2 className='text-2xl font-semibold mb-2 text-foreground'>No decks found</h2>
                    <p className='text-muted-foreground mb-6'>
                        {search ? 'No decks match your search' : 'Create your first deck to begin studying'}
                    </p>
                    {!search && (
                        <Button onClick={open}>
                            <Plus className='h-4 w-4 mr-2' />
                            Create Your First Deck
                        </Button>
                    )}
                </div>
            ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                    {filteredDecks.map((deck: DeckInterface) => (
                        <Card
                            key={deck._id}
                            className={cn(
                                'overflow-hidden hover:shadow-md transition-shadow cursor-pointer',
                                'hover:border-primary/30'
                            )}
                            onClick={() => handleDeckClick(deck._id)}
                        >
                            <CardContent className='p-6 h-44 flex flex-col'>
                                <h3 className='font-bold text-lg mb-2 line-clamp-2 text-foreground'>{deck.name}</h3>
                                <p className='text-muted-foreground text-sm mb-4 flex-grow line-clamp-3'>
                                    {deck.description || 'No description'}
                                </p>
                                <div className='mt-auto'>
                                    <div className='flex items-center text-sm text-primary'>
                                        <GraduationCap className='h-4 w-4 mr-1' />
                                        <span>
                                            {deck.cardCount} {deck.cardCount === 1 ? 'card' : 'cards'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className='py-2 px-6 border-t flex justify-between'>
                                <div className='flex items-center text-xs text-muted-foreground'>
                                    <Clock className='h-3 w-3 mr-1' />
                                    <span>Updated {format(new Date(deck.updatedAt), 'MMM d, yyyy')}</span>
                                </div>
                                <div className='space-x-2'>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    className='p-0 h-auto text-primary hover:text-primary hover:bg-primary/10'
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/study/${deck._id}`);
                                                    }}
                                                >
                                                    <GraduationCap className='h-4 w-4' />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Study</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                {deck.isPublic && deck.owner ? (
                                                    <Button
                                                        variant='ghost'
                                                        size='sm'
                                                        className='p-0 h-auto'
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Avatar className='h-4 w-4'>
                                                            {deck.owner.avatar ? (
                                                                <AvatarImage
                                                                    src={deck.owner.avatar}
                                                                    alt={deck.owner.username || 'User'}
                                                                />
                                                            ) : (
                                                                <AvatarFallback className='text-[8px] bg-primary/10 text-primary'>
                                                                    {(deck.owner.username || 'U').charAt(0)}
                                                                </AvatarFallback>
                                                            )}
                                                        </Avatar>
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant='ghost'
                                                        size='sm'
                                                        className='p-0 h-auto text-primary hover:text-primary hover:bg-primary/10'
                                                    >
                                                        <Earth className='h-4 w-4' />
                                                    </Button>
                                                )}
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {deck.isPublic && deck.owner
                                                    ? `Created by ${deck.owner.username || 'User'}`
                                                    : 'Share'}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Library;
