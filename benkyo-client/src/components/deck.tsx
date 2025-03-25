import { DeckInterface } from '@/types/deck';
import { Card, CardContent, CardFooter } from './ui/card';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Clock, Earth, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface DeckProps {
    deck: DeckInterface;
}

function Deck({ deck }: DeckProps) {
    const navigate = useNavigate();
    const handleDeckClick = (deckId: string) => {
        navigate(`/deck/${deckId}`);
    };
    return (
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
                                {deck.isPublic && deck.owner ? `Created by ${deck.owner.username || 'User'}` : 'Share'}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </CardFooter>
        </Card>
    );
}

export default Deck;
