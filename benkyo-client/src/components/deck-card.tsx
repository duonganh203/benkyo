import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Star } from 'lucide-react';

export interface DeckInClass {
    _id: string;
    name: string;
    description?: string;
    cardCount: number;
    avgRating?: number;
    startTime?: Date;
    endTime?: Date;
}

export interface DeckCardProps {
    deck: DeckInClass;
    index: number;
    onStartStudy: (deck: DeckInClass) => void;
}

const DeckCard = ({ deck, index, onStartStudy }: DeckCardProps) => {
    const getProgressPercentage = (completed: number, total: number) => {
        if (total === 0) return 0;
        return Math.round((completed / total) * 100);
    };

    const progressPercentage = getProgressPercentage(0, deck.cardCount);

    return (
        <Card
            className='flex flex-col justify-between group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-in-up'
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => onStartStudy(deck)}
        >
            <div className='p-6 space-y-4'>
                <div className='flex items-start justify-between'>
                    <h3 className='font-semibold text-lg group-hover:text-primary transition-colors'>{deck.name}</h3>
                    <div className='flex items-center space-x-1 text-sm flex-shrink-0 ml-2'>
                        <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                        <span className='font-medium'>{deck.avgRating?.toFixed(1) || 'N/A'}</span>
                    </div>
                </div>

                <p className='text-sm text-muted-foreground leading-relaxed h-10 line-clamp-2'>
                    {deck.description || 'No description provided.'}
                </p>

                <div className='space-y-2'>
                    <div className='flex justify-between text-xs font-medium'>
                        <span>Progress</span>
                        <span>{progressPercentage}%</span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700'>
                        <div
                            className='bg-primary h-2 rounded-full transition-all duration-500'
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                    <p className='text-xs text-muted-foreground'>0/{deck.cardCount} cards studied</p>
                </div>
            </div>

            <div className='flex items-center justify-between p-6 pt-4 border-t bg-gray-50/50 dark:bg-black/20'>
                <div className='flex items-center space-x-4 text-sm text-muted-foreground'>
                    <div className='flex items-center space-x-1.5' title={`${deck.cardCount} cards`}>
                        <BookOpen className='h-4 w-4' />
                        <span>{deck.cardCount}</span>
                    </div>
                    <div className='flex items-center space-x-1.5' title='Estimated time'>
                        <Clock className='h-4 w-4' />
                        <span>~{Math.round(deck.cardCount * 0.5)} min</span>
                    </div>
                </div>
                <Badge variant='outline'>Medium</Badge>
            </div>
        </Card>
    );
};

export default DeckCard;
