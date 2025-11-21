import { useState, useEffect, useRef } from 'react';
import { Trash2, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
    onViewInDocument?: (index: number) => void;
}

const AICardEditor: React.FC<AICardEditorProps> = ({
    card,
    index,
    validation,
    onChange,
    onTagChange,
    onRemove,
    onViewInDocument
}) => {
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
                <div className='flex items-center justify-between mb-4'>
                    <h3 className='font-medium'>Card {index + 1}</h3>
                    <div className='flex gap-2'>
                        {onViewInDocument && (card.sourceText || card.pageNumber) && (
                            <Button type='button' size='sm' variant='outline' onClick={() => onViewInDocument(index)}>
                                <FileText className='h-3.5 w-3.5 mr-1.5' />
                                View in Document
                            </Button>
                        )}
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
                </div>

                <div className='space-y-4'>
                    <div className='space-y-2'>
                        <Label htmlFor={`card-${index}-front`} className='text-sm'>
                            Question
                        </Label>
                        <Textarea
                            id={`card-${index}-front`}
                            value={card.front}
                            onChange={(e) => onChange(index, 'front', e.target.value)}
                            placeholder='Enter question'
                            className={`w-full ${hasFrontError ? 'border-destructive' : ''}`}
                            rows={2}
                        />
                        {hasFrontError && <p className='text-sm text-destructive mt-1'>{validation.front}</p>}
                    </div>

                    <div className='space-y-2'>
                        <Label htmlFor={`card-${index}-back`} className='text-sm'>
                            Answer
                        </Label>
                        <Textarea
                            id={`card-${index}-back`}
                            value={card.back}
                            onChange={(e) => onChange(index, 'back', e.target.value)}
                            placeholder='Enter answer'
                            className={`w-full min-h-[100px] ${hasBackError ? 'border-destructive' : ''}`}
                            rows={2}
                        />
                        {hasBackError && <p className='text-sm text-destructive mt-1'>{validation.back}</p>}
                    </div>

                    <div className='space-y-2'>
                        <Label htmlFor={`card-${index}-tags`} className='text-sm'>
                            Tags
                        </Label>
                        <Input
                            id={`card-${index}-tags`}
                            value={tagInput}
                            onChange={handleTagInputChange}
                            onBlur={handleTagBlur}
                            placeholder='Enter tags separated by commas'
                            className='w-full'
                        />
                    </div>
                </div>

                {card.sourceText && (
                    <div className='mt-3 p-2 bg-muted rounded-md'>
                        <p className='text-xs text-muted-foreground mb-1'>Source from document:</p>
                        <p className='text-xs italic line-clamp-2'>{card.sourceText}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default AICardEditor;
