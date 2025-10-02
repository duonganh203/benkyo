import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Star } from 'lucide-react';
import { DeckInClass } from '@/types/class';

export interface DeckCardProps {
    deck: DeckInClass;
    index: number;
    onStartStudy: (deck: DeckInClass) => void;
}

const DeckCard = ({ deck, index, onStartStudy }: DeckCardProps) => {
    const correct = deck.correctCount ?? 0;
    const total =
        deck.totalCount === undefined || deck.totalCount === null || deck.totalCount === 0
            ? deck.cardCount
            : deck.totalCount;

    const progressPercentage = total > 0 ? Math.round((correct / total) * 100) : 0;

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
                    <p className='text-xs text-muted-foreground'>
                        {correct}/{total} cards studied
                    </p>
                </div>

                {(deck.startTime || deck.endTime) && (
                    <div className='mt-3 p-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-md'>
                        <div className='flex items-center gap-1 text-xs font-medium text-blue-800 mb-1'>
                            <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
                                <path
                                    fillRule='evenodd'
                                    d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
                                    clipRule='evenodd'
                                />
                            </svg>
                            <span>Lịch học</span>
                        </div>
                        <div className='text-xs space-y-1'>
                            {deck.startTime && (
                                <div className='flex items-center justify-between'>
                                    <span className='text-green-700 font-medium'>Bắt đầu:</span>
                                    <span className='text-green-800 bg-green-100 px-1.5 py-0.5 rounded text-xs'>
                                        {new Date(deck.startTime).toLocaleDateString('vi-VN', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            )}
                            {deck.endTime && (
                                <div className='flex items-center justify-between'>
                                    <span className='text-red-700 font-medium'>Kết thúc:</span>
                                    <span className='text-red-800 bg-red-100 px-1.5 py-0.5 rounded text-xs'>
                                        {new Date(deck.endTime).toLocaleDateString('vi-VN', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
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
