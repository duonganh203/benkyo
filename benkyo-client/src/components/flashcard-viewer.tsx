import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CardInterface } from '@/types/card';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface FlashcardViewerProps {
    cards: CardInterface[];
    currentIndex?: number;
    initialIndex?: number; // controlled index
    onCardChange?: (index: number) => void;
}

const FlashcardViewer: React.FC<FlashcardViewerProps> = ({ cards, currentIndex = 0, onCardChange }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    if (!cards || cards.length === 0) return null;

    const currentCard = cards[currentIndex];

    // Reset flip khi đổi card
    useEffect(() => {
        setIsFlipped(false);
    }, [currentIndex, cards]);

    const handleFlip = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setIsFlipped(!isFlipped);
        setTimeout(() => setIsAnimating(false), 300);
    };

    const handleNext = () => {
        if (currentIndex < cards.length - 1) {
            onCardChange?.(currentIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            onCardChange?.(currentIndex - 1);
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            switch (event.key) {
                case 'ArrowLeft':
                    event.preventDefault();
                    handlePrevious();
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    handleNext();
                    break;
                case ' ':
                case 'Enter':
                    event.preventDefault();
                    handleFlip();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, cards]);

    return (
        <div className='w-full'>
            <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-bold'>Flashcard Preview</h2>
                <span className='text-sm text-muted-foreground'>
                    {currentIndex + 1} / {cards.length}
                </span>
            </div>

            <div className='flex justify-center mb-6 w-full'>
                <div className='relative perspective-1000 w-full'>
                    <div
                        className={`relative w-full h-80 transition-transform duration-300 transform-style-preserve-3d ${
                            isFlipped ? 'rotate-y-180' : ''
                        }`}
                    >
                        {/* Front */}
                        <div className='absolute inset-0 backface-hidden'>
                            <Card
                                className='w-full h-full cursor-pointer hover:shadow-lg transition-shadow'
                                onClick={handleFlip}
                            >
                                <CardContent className='flex flex-col h-full p-8'>
                                    <div className='text-xs text-muted-foreground mb-4 uppercase tracking-wide'>
                                        Front
                                    </div>
                                    <div
                                        className='flex-1 flex items-center justify-center text-center text-lg'
                                        dangerouslySetInnerHTML={{ __html: currentCard.front }}
                                    />
                                    <div className='mt-6 flex flex-wrap gap-2'>
                                        {currentCard.tags.map((tag) => (
                                            <Badge key={tag} variant='outline' className='text-xs'>
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Back */}
                        <div className='absolute inset-0 backface-hidden rotate-y-180'>
                            <Card
                                className='w-full h-full cursor-pointer hover:shadow-lg transition-shadow bg-muted/30'
                                onClick={handleFlip}
                            >
                                <CardContent className='flex flex-col h-full p-8'>
                                    <div className='text-xs text-muted-foreground mb-4 uppercase tracking-wide'>
                                        Back
                                    </div>
                                    <div
                                        className='flex-1 flex items-center justify-center text-center text-lg'
                                        dangerouslySetInnerHTML={{ __html: currentCard.back }}
                                    />
                                    <div className='mt-6 flex flex-wrap gap-2'>
                                        {currentCard.tags.map((tag) => (
                                            <Badge key={tag} variant='outline' className='text-xs'>
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className='flex items-center justify-center gap-4 mb-6'>
                <Button
                    variant='outline'
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className='flex items-center gap-2'
                >
                    <ChevronLeft className='h-4 w-4' /> Previous
                </Button>
                <Button
                    variant='outline'
                    onClick={handleNext}
                    disabled={currentIndex === cards.length - 1}
                    className='flex items-center gap-2'
                >
                    Next <ChevronRight className='h-4 w-4' />
                </Button>
            </div>

            <div className='text-center'>
                <p className='text-sm text-muted-foreground mb-2'>
                    Click the card or button to flip between front and back
                </p>
            </div>
        </div>
    );
};

export default FlashcardViewer;
