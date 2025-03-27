import { useState } from 'react';
import { FileText, UploadCloud, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BatchImportCard } from '@/types/card';

interface ImportStats {
    total: number;
    valid: number;
    invalid: number;
    processed: number;
}

interface BatchImportFormProps {
    onImportConfirm: () => void;
    importCards: BatchImportCard[];
    setImportCards: (cards: BatchImportCard[]) => void;
}

const BatchImportForm = ({ onImportConfirm, importCards, setImportCards }: BatchImportFormProps) => {
    const [importContent, setImportContent] = useState<string>('');
    const [delimiter, setDelimiter] = useState<string>(';');
    const [previewCards, setPreviewCards] = useState<BatchImportCard[]>([]);
    const [importStats, setImportStats] = useState<ImportStats>({
        total: 0,
        valid: 0,
        invalid: 0,
        processed: 0
    });

    const resetImportForm = () => {
        setImportContent('');
        setImportCards([]);
        setPreviewCards([]);
        setImportStats({
            total: 0,
            valid: 0,
            invalid: 0,
            processed: 0
        });
    };

    const parseImportContent = () => {
        const lines = importContent.trim().split('\n');
        const cards: BatchImportCard[] = [];
        let validCards = 0;
        let invalidCards = 0;

        lines.forEach((line) => {
            const parts = line.split(delimiter);
            if (parts.length >= 2) {
                const [front, back, ...tagParts] = parts;
                const tags =
                    tagParts.length > 0
                        ? tagParts[0]
                              .split(',')
                              .map((t) => t.trim())
                              .filter(Boolean)
                        : [];

                if (front.trim() && back.trim()) {
                    cards.push({
                        front: front.trim(),
                        back: back.trim(),
                        tags
                    });
                    validCards++;
                } else {
                    invalidCards++;
                }
            } else {
                invalidCards++;
            }
        });

        setImportCards(cards);
        setPreviewCards(cards.slice(0, 5));
        setImportStats({
            total: lines.length,
            valid: validCards,
            invalid: invalidCards,
            processed: 0
        });
    };

    return (
        <Card className='border-none shadow-none transition-all bg-transparent'>
            <CardContent className='p-0'>
                <div className='space-y-6'>
                    <div className='bg-muted/40 rounded-md p-4 border border-dashed animate-slide-up animation-delay-300'>
                        <div className='text-center py-6'>
                            <UploadCloud className='h-10 w-10 mx-auto text-muted-foreground mb-4 animate-bounce-small' />
                            <h3 className='text-lg font-medium mb-2'>Batch Import Cards</h3>
                            <p className='text-muted-foreground text-sm max-w-md mx-auto mb-4'>
                                Each line should contain front and back content separated by a delimiter. Optionally
                                include tags as a third element.
                            </p>

                            <div className='flex items-center justify-center gap-2 mb-4'>
                                <Label htmlFor='delimiter' className='text-sm'>
                                    Delimiter:
                                </Label>
                                <select
                                    id='delimiter'
                                    className='h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-all hover:border-primary/50'
                                    value={delimiter}
                                    onChange={(e) => setDelimiter(e.target.value)}
                                >
                                    <option value=';'>Semicolon</option>
                                    <option value=','>Comma</option>
                                    <option value='|'>Pipe</option>
                                </select>
                            </div>

                            <Textarea
                                placeholder={`Question${delimiter}Answer${delimiter}tag1,tag2,tag3`}
                                className='h-48 mb-4 font-mono transition-all focus:ring-2 focus:ring-ring/30'
                                value={importContent}
                                onChange={(e) => setImportContent(e.target.value)}
                            />

                            <Button
                                onClick={parseImportContent}
                                disabled={!importContent.trim()}
                                className='transition-all'
                            >
                                <FileText className='h-4 w-4 mr-2' />
                                Parse Content
                            </Button>
                        </div>
                    </div>

                    {importStats.total > 0 && (
                        <div className='space-y-4 animate-slide-up animation-delay-300'>
                            <div className='grid grid-cols-3 gap-4 text-center'>
                                <div className='p-3 rounded-md bg-muted hover:shadow-md transition-all'>
                                    <div className='text-2xl font-bold'>{importStats.total}</div>
                                    <div className='text-xs text-muted-foreground'>Total Lines</div>
                                </div>
                                <div className='p-3 rounded-md bg-muted hover:shadow-md transition-all'>
                                    <div className='text-2xl font-bold text-primary'>{importStats.valid}</div>
                                    <div className='text-xs text-muted-foreground'>Valid Cards</div>
                                </div>
                                <div className='p-3 rounded-md bg-muted hover:shadow-md transition-all'>
                                    <div className='text-2xl font-bold text-destructive'>{importStats.invalid}</div>
                                    <div className='text-xs text-muted-foreground'>Invalid Lines</div>
                                </div>
                            </div>

                            {previewCards.length > 0 && (
                                <div className='animate-slide-up animation-delay-400'>
                                    <h3 className='text-sm font-medium mb-2'>
                                        Preview ({Math.min(previewCards.length, 5)} of {importCards.length}):
                                    </h3>
                                    <div className='space-y-2'>
                                        {previewCards.map((card, index) => (
                                            <div
                                                key={index}
                                                className='p-3 rounded-md border text-sm hover:shadow-md transition-all animate-slide-up'
                                                style={{ animationDelay: `${(index + 4) * 100}ms` }}
                                            >
                                                <div className='grid grid-cols-2 gap-4'>
                                                    <div>
                                                        <div className='text-xs text-muted-foreground mb-1'>
                                                            Question:
                                                        </div>
                                                        <div className='font-medium'>{card.front}</div>
                                                    </div>
                                                    <div>
                                                        <div className='text-xs text-muted-foreground mb-1'>
                                                            Answer:
                                                        </div>
                                                        <div>{card.back}</div>
                                                    </div>
                                                </div>
                                                {card.tags.length > 0 && (
                                                    <div className='mt-2'>
                                                        <div className='text-xs text-muted-foreground mb-1'>Tags:</div>
                                                        <div className='flex flex-wrap gap-1'>
                                                            {card.tags.map((tag, i) => (
                                                                <Badge
                                                                    key={i}
                                                                    variant='outline'
                                                                    className='text-xs animate-scale-in'
                                                                    style={{ animationDelay: `${i * 50}ms` }}
                                                                >
                                                                    {tag}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className='flex justify-end gap-2 pt-4 animate-slide-up animation-delay-600'>
                                <Button
                                    variant='outline'
                                    onClick={resetImportForm}
                                    className='hover:bg-destructive/10 hover:text-destructive transition-all'
                                >
                                    <Trash2 className='h-4 w-4 mr-2' />
                                    Clear
                                </Button>
                                <Button
                                    onClick={onImportConfirm}
                                    disabled={importCards.length === 0}
                                    className='transition-all'
                                >
                                    <Upload className='h-4 w-4 mr-2' />
                                    Import {importCards.length} Cards
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default BatchImportForm;
