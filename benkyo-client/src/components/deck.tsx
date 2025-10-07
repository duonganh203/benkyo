import { useNavigate } from 'react-router-dom';
import { DeckInterface } from '@/types/deck';
import { cn } from '@/lib/utils';
import { useSendRequestPublicDeckModal } from '@/hooks/stores/use-send-request-public-deck-modal';
import { Clock, Earth, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';

const statusMap: Record<string, { label: string; className: string }> = {
    1: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
    2: { label: 'Approved', className: 'bg-green-100 text-green-700' },
    3: { label: 'Rejected', className: 'bg-red-100 text-red-700' }
};

interface DeckProps {
    deck: DeckInterface;
    showStatus?: boolean;
}

function Deck({ deck, showStatus = false }: DeckProps) {
    const { open } = useSendRequestPublicDeckModal((store) => store);
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
            <CardContent className='p-6 h-44 flex flex-col relative'>
                {showStatus && deck.publicStatus !== undefined && (
                    <Badge className={cn('absolute top-3 right-3', statusMap[deck.publicStatus]?.className)}>
                        {statusMap[deck.publicStatus]?.label || 'Unknown'}
                    </Badge>
                )}

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
                <div className='space-x-2 flex items-center'>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <GraduationCap
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/study/${deck._id}`);
                                    }}
                                    className='h-5 w-5 text-primary/80 hover:text-primary rounded-md'
                                />
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
                                    <Avatar className='h-5 w-5'>
                                        {deck.owner.avatar ? (
                                            <AvatarImage src={deck.owner.avatar} alt={deck.owner.name || 'User'} />
                                        ) : (
                                            <AvatarFallback className='text-[8px] bg-primary/10 text-primary'>
                                                {(deck.owner.name || 'U').charAt(0)}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                ) : (
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            open(deck._id);
                                        }}
                                        variant='ghost'
                                        size='sm'
                                        className='p-0 h-auto text-primary hover:text-primary hover:bg-primary/10'
                                    >
                                        <Earth className='h-6 w-6' />
                                    </Button>
                                )}
                            </TooltipTrigger>
                            <TooltipContent>
                                {deck.isPublic && deck.owner ? `Created by ${deck.owner.name || 'User'}` : 'Share'}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </CardFooter>
        </Card>
    );
}

export default Deck;
