import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';
import { useCreateMooc } from '@/hooks/queries/use-create-mooc-in-class';

interface CardData {
    front: string;
    back: string;
    tags: string[];
}

interface DeckData {
    name: string;
    description: string;
    order: number;
    cards: CardData[];
}

export const ClassCreateMooc = () => {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const createMoocMutation = useCreateMooc(classId!);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [decks, setDecks] = useState<DeckData[]>([]);
    const [isPaid, setIsPaid] = useState(false);
    const [isPublic, setIsPublic] = useState(true);
    const [price, setPrice] = useState('');
    const [currency, setCurrency] = useState('VND');
    const [currentTags, setCurrentTags] = useState<{ [key: string]: string }>({});
    const getTagKey = (deckIndex: number, cardIndex: number) => `${deckIndex}-${cardIndex}`;
    const addDeck = () => {
        setDecks([...decks, { name: '', description: '', order: decks.length, cards: [] }]);
    };

    const removeDeck = (index: number) => setDecks(decks.filter((_, i) => i !== index));

    const updateDeck = (index: number, field: keyof DeckData, value: any) => {
        const newDecks = [...decks];
        newDecks[index] = { ...newDecks[index], [field]: value };
        setDecks(newDecks);
    };

    const addCard = (deckIndex: number) => {
        const newDecks = [...decks];
        newDecks[deckIndex].cards.push({ front: '', back: '', tags: [] });
        setDecks(newDecks);
    };

    const updateCard = (deckIndex: number, cardIndex: number, field: keyof CardData, value: any) => {
        const newDecks = [...decks];
        newDecks[deckIndex].cards[cardIndex] = { ...newDecks[deckIndex].cards[cardIndex], [field]: value };
        setDecks(newDecks);
    };

    const addTag = (deckIndex: number, cardIndex: number, tag: string) => {
        if (!tag.trim()) return;
        const newDecks = [...decks];
        const tags = newDecks[deckIndex].cards[cardIndex].tags;
        if (!tags.includes(tag.trim())) {
            newDecks[deckIndex].cards[cardIndex].tags = [...tags, tag.trim()];
            setDecks(newDecks);
        }
    };

    const removeTag = (deckIndex: number, cardIndex: number, tagIndex: number) => {
        const newDecks = [...decks];
        newDecks[deckIndex].cards[cardIndex].tags = newDecks[deckIndex].cards[cardIndex].tags.filter(
            (_, i) => i !== tagIndex
        );
        setDecks(newDecks);
    };

    const handleSubmit = () => {
        if (!title.trim()) return toast.error('Please enter a MOOC title');

        const payload = {
            title,
            description: description || undefined,
            decks: decks.map((d) => ({
                name: d.name,
                description: d.description || undefined,
                order: d.order,
                cards: d.cards.map((c) => ({
                    front: c.front,
                    back: c.back,
                    tags: c.tags.length ? c.tags : undefined
                }))
            })),
            isPaid,
            price: isPaid ? parseFloat(price) : undefined,
            currency: isPaid ? currency : undefined,
            publicStatus: isPublic ? 2 : 0
        };

        createMoocMutation.mutate(payload, {
            onSuccess: (res) => {
                toast.success(res.message || 'MOOC created successfully!');
                setTitle('');
                setDescription('');
                setDecks([]);
                setIsPaid(false);
                setPrice('');
                setCurrency('VND');
                setIsPublic(true);
            },
            onError: (err) => toast.error(err.message || 'Failed to create MOOC')
        });
    };

    return (
        <div className='min-h-screen flex items-center justify-center p-6'>
            <Card className='w-full max-w-4xl card-gradient border-border shadow-2xl transition-smooth'>
                <div className='p-8 space-y-8'>
                    {/* Header */}
                    <div className='text-center space-y-2'>
                        <h1 className='text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent'>
                            Create New MOOC
                        </h1>
                        <p className='text-muted-foreground text-lg'>
                            Build your online course with custom decks and flashcards
                        </p>
                    </div>

                    {/* MOOC Title */}
                    <div className='space-y-2'>
                        <Label htmlFor='title' className='font-semibold'>
                            MOOC Title
                        </Label>
                        <Input
                            id='title'
                            placeholder='Enter MOOC title'
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Description */}
                    <div className='space-y-2'>
                        <Label htmlFor='description' className='font-semibold'>
                            Description
                        </Label>
                        <Textarea
                            id='description'
                            placeholder='Describe your MOOC...'
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Pricing & Visibility */}
                    <div className='space-y-4 p-6 rounded-lg bg-card/50 border border-border'>
                        <div className='flex items-center justify-between'>
                            <Label className='font-semibold'>Paid MOOC</Label>
                            <Switch checked={isPaid} onCheckedChange={setIsPaid} />
                        </div>
                        <div className='flex items-center justify-between border-t pt-4'>
                            <Label className='font-semibold'>Public</Label>
                            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                        </div>

                        {isPaid && (
                            <div className='grid grid-cols-2 gap-4 pt-4 border-t border-border'>
                                <div className='space-y-2'>
                                    <Label htmlFor='price'>Price</Label>
                                    <Input
                                        id='price'
                                        type='number'
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='currency'>Currency</Label>
                                    <Select value={currency} onValueChange={setCurrency}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='VND'>VND</SelectItem>
                                            <SelectItem value='USD'>USD</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Decks */}
                    <div className='space-y-4'>
                        <div className='flex items-center justify-between'>
                            <Label className='font-semibold text-lg'>Decks</Label>
                            <Button onClick={addDeck} size='sm'>
                                <Plus className='w-4 h-4 mr-2' /> Add Deck
                            </Button>
                        </div>

                        {decks.map((deck, deckIndex) => (
                            <Card key={deckIndex} className='p-6 bg-secondary/50 border-border space-y-4'>
                                <div className='flex justify-between'>
                                    <div className='flex-1 space-y-3'>
                                        <Input
                                            placeholder='Deck name'
                                            value={deck.name}
                                            onChange={(e) => updateDeck(deckIndex, 'name', e.target.value)}
                                        />
                                        <Textarea
                                            placeholder='Deck description'
                                            value={deck.description}
                                            onChange={(e) => updateDeck(deckIndex, 'description', e.target.value)}
                                        />
                                    </div>
                                    <Button variant='ghost' size='icon' onClick={() => removeDeck(deckIndex)}>
                                        <X className='w-5 h-5 text-destructive' />
                                    </Button>
                                </div>

                                <div className='space-y-3 border-t pt-4'>
                                    <div className='flex justify-between'>
                                        <Label className='font-semibold text-sm'>Cards</Label>
                                        <Button onClick={() => addCard(deckIndex)} size='sm' variant='secondary'>
                                            <Plus className='w-3 h-3 mr-1' /> Add Card
                                        </Button>
                                    </div>

                                    {deck.cards.map((card, cardIndex) => (
                                        <Card key={cardIndex} className='p-4 bg-background'>
                                            <Input
                                                placeholder='Front side'
                                                value={card.front}
                                                onChange={(e) =>
                                                    updateCard(deckIndex, cardIndex, 'front', e.target.value)
                                                }
                                            />
                                            <Input
                                                placeholder='Back side'
                                                value={card.back}
                                                onChange={(e) =>
                                                    updateCard(deckIndex, cardIndex, 'back', e.target.value)
                                                }
                                            />
                                            <div className='flex gap-2 mt-2'>
                                                <Input
                                                    placeholder='Add tag'
                                                    value={currentTags[getTagKey(deckIndex, cardIndex)] || ''}
                                                    onChange={(e) =>
                                                        setCurrentTags({
                                                            ...currentTags,
                                                            [getTagKey(deckIndex, cardIndex)]: e.target.value
                                                        })
                                                    }
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            const tag =
                                                                currentTags[getTagKey(deckIndex, cardIndex)] || '';
                                                            addTag(deckIndex, cardIndex, tag);
                                                            setCurrentTags({
                                                                ...currentTags,
                                                                [getTagKey(deckIndex, cardIndex)]: ''
                                                            });
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    onClick={() => {
                                                        const tag = currentTags[getTagKey(deckIndex, cardIndex)] || '';
                                                        addTag(deckIndex, cardIndex, tag);
                                                        setCurrentTags({
                                                            ...currentTags,
                                                            [getTagKey(deckIndex, cardIndex)]: ''
                                                        });
                                                    }}
                                                    size='sm'
                                                    variant='secondary'
                                                >
                                                    Add
                                                </Button>
                                            </div>

                                            {card.tags.length > 0 && (
                                                <div className='flex flex-wrap gap-2 mt-2'>
                                                    {card.tags.map((tag, tagIndex) => (
                                                        <Badge key={tagIndex} variant='secondary' className='gap-1'>
                                                            {tag}
                                                            <button
                                                                onClick={() =>
                                                                    removeTag(deckIndex, cardIndex, tagIndex)
                                                                }
                                                                className='ml-1 hover:text-destructive'
                                                            >
                                                                <X className='w-3 h-3' />
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className='flex gap-4 pt-6 border-t border-border'>
                        <Button variant='outline' className='flex-1' onClick={() => navigate(-1)}>
                            Cancel
                        </Button>
                        <Button className='flex-1' onClick={handleSubmit} disabled={createMoocMutation.isPending}>
                            {createMoocMutation.isPending ? 'Creating...' : 'Create MOOC'}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};
