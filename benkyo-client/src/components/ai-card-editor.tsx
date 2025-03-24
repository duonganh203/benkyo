import { useState, useEffect, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BatchImportCard } from '@/types/card';

interface CardValidation {
    front: string | null;
    back: string | null;
}

interface AICardEditorProps {
    card: BatchImportCard;
    index: number;
    validation?: CardValidation;
    onChange: (index: number, field: 'front' | 'back', value: string) => void;
    onTagChange: (index: number, tagsString: string) => void;
    onRemove: (index: number) => void;
}

const AICardEditor: React.FC<AICardEditorProps> = ({ card, index, validation, onChange, onTagChange, onRemove }) => {
    const hasFrontError = !!validation?.front;
    const hasBackError = !!validation?.back;
    const hasError = hasFrontError || hasBackError;

    const isFirstRender = useRef(true);

    const [tagInput, setTagInput] = useState(() => {
        return card.tags && Array.isArray(card.tags) ? card.tags.join(', ') : '';
    });

    useEffect(() => {
        if (isFirstRender.current) {
            if (card.tags && Array.isArray(card.tags)) {
                setTagInput(card.tags.join(', '));
            }
            isFirstRender.current = false;
        }
    }, [card.tags]);

    const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setTagInput(newValue);
    };

    const handleTagBlur = () => {
        onTagChange(index, tagInput);
    };

    return (
        <Card
            className={`overflow-hidden transition-all duration-200 hover:shadow-md ${
                hasError ? 'border-destructive/50 bg-destructive/5' : ''
            }`}
        >
            <CardContent className='p-4'>
                <div className='flex justify-between items-center mb-4'>
                    <h3 className='font-medium'>Card {index + 1}</h3>
                    <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => onRemove(index)}
                        className='h-8 w-8 text-muted-foreground hover:text-destructive'
                    >
                        <Trash2 className='h-4 w-4' />
                        <span className='sr-only'>Remove card</span>
                    </Button>
                </div>

                <div className='space-y-4'>
                    <div className='space-y-2'>
                        <label htmlFor={`front-${index}`} className='text-sm font-medium'>
                            Front
                        </label>
                        <Input
                            id={`front-${index}`}
                            value={card.front}
                            onChange={(e) => onChange(index, 'front', e.target.value)}
                            placeholder='Enter the question or term'
                            className={`w-full ${hasFrontError ? 'border-destructive' : ''}`}
                        />
                        {hasFrontError && <p className='text-sm text-destructive mt-1'>{validation.front}</p>}
                    </div>

                    <div className='space-y-2'>
                        <label htmlFor={`back-${index}`} className='text-sm font-medium'>
                            Back
                        </label>
                        <Textarea
                            id={`back-${index}`}
                            value={card.back}
                            onChange={(e) => onChange(index, 'back', e.target.value)}
                            placeholder='Enter the answer or definition'
                            className={`w-full min-h-[100px] ${hasBackError ? 'border-destructive' : ''}`}
                        />
                        {hasBackError && <p className='text-sm text-destructive mt-1'>{validation.back}</p>}
                    </div>

                    <div className='space-y-2'>
                        <label htmlFor={`tags-${index}`} className='text-sm font-medium'>
                            Tags (comma separated)
                        </label>
                        <Input
                            id={`tags-${index}`}
                            value={tagInput}
                            onChange={handleTagInputChange}
                            onBlur={handleTagBlur}
                            placeholder='tag1, tag2, tag3'
                            className='w-full'
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AICardEditor;
