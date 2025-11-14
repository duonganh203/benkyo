import { useState, useEffect, useRef } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { getToast } from '@/utils/getToast';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetMoocDetail } from '@/hooks/queries/use-get-mooc-detail';
import useUpdateMooc from '@/hooks/queries/use-update-mooc-in-class';
import useGetDeckCards from '@/hooks/queries/use-get-deck-cards';
import useDeleteCard from '@/hooks/queries/use-delete-card';
import useDeleteDeck from '@/hooks/queries/use-delete-deck';
interface CardData {
    _id?: string;
    front: string;
    back: string;
    tags: string[];
}

interface DeckData {
    _id?: string;
    name: string;
    description: string;
    order: number;
    cards: CardData[];
}

export const ClassUpdateMooc = () => {
    const { moocId } = useParams<{ moocId: string }>();
    const navigate = useNavigate();

    const { data: mooc, isLoading: moocLoading, refetch } = useGetMoocDetail(moocId!);
    const updateMoocMutation = useUpdateMooc();
    const deleteCardMutation = useDeleteCard();
    const deleteDeckMutation = useDeleteDeck();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPaid, setIsPaid] = useState(false);
    const [isPublic, setIsPublic] = useState(true);
    const [price, setPrice] = useState('');
    const [currency, setCurrency] = useState('VND');
    const [newTagInputs, setNewTagInputs] = useState<{ [key: string]: string }>({});
    const [decks, setDecks] = useState<DeckData[]>([]);
    const [deckCardsData, setDeckCardsData] = useState<CardData[][]>([]);
    const deckRefs = useRef<Array<HTMLDivElement | null>>([]);
    const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const [locked, setLocked] = useState(false);

    if (moocLoading) return <p className='text-center py-10'>Loading MOOC data...</p>;
    if (!mooc) return <p className='text-center py-10'>MOOC not found.</p>;

    const deckIds = (mooc?.decks || [])
        .map((d: { deck?: { _id: string }; _id?: string }) => d.deck ?? d)
        .filter((deck: any) => deck && deck._id && deck.name)
        .map((deck: any) => deck._id);

    const deckCardsQueries = deckIds.map((deckId) => useGetDeckCards(deckId));

    useEffect(() => {
        const allDeckCards = deckCardsQueries.map((q) => q.data || []);
        setDeckCardsData(allDeckCards);
    }, [deckCardsQueries.map((q) => q.data).join(',')]);

    useEffect(() => {
        if (deckCardsData.length === deckIds.length) {
            const mergedDecks: DeckData[] =
                mooc.decks
                    ?.filter((deckWrapper: any) => (deckWrapper.deck ?? deckWrapper)?._id)
                    .map((deckWrapper: any, index: number) => {
                        const deck = deckWrapper.deck ?? deckWrapper;
                        return {
                            _id: deck._id,
                            name: deck.name || '',
                            description: deck.description || '',
                            order: deckWrapper.order ?? index,
                            cards: deckCardsData[index] || []
                        };
                    }) || [];
            setDecks(mergedDecks);
            setTitle(mooc.title || '');
            setDescription(mooc.description || '');
            setIsPaid(!!mooc.isPaid);
            setPrice(mooc.price?.toString() || '');
            setCurrency(mooc.currency || 'VND');
            setIsPublic(mooc.publicStatus === 2);
            setLocked(!!mooc.locked);
        }
    }, [deckCardsData, mooc]);

    const addDeck = () => {
        setDecks((prev) => {
            const newDecks = [...prev, { name: '', description: '', order: prev.length, cards: [] }];
            setTimeout(() => {
                const lastIndex = newDecks.length - 1;
                if (deckRefs.current[lastIndex]) {
                    deckRefs.current[lastIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
            return newDecks;
        });
    };

    const removeDeck = async (deckIndex: number) => {
        const deckToDelete = decks[deckIndex];
        if (!deckToDelete._id) {
            setDecks((prev) => prev.filter((_, i) => i !== deckIndex));
            setDeckCardsData((prev) => prev.filter((_, i) => i !== deckIndex));
            getToast('success', 'Deck removed locally');
            return;
        }

        try {
            await deleteDeckMutation.mutateAsync({ deckId: deckToDelete._id });
            setDecks((prev) => prev.filter((_, i) => i !== deckIndex));
            setDeckCardsData((prev) => prev.filter((_, i) => i !== deckIndex));
            getToast('success', 'Deck deleted successfully');
        } catch (err) {
            console.error(err);
            getToast('error', 'Failed to delete deck');
        }
    };

    const updateDeck = (index: number, field: keyof DeckData, value: any) => {
        const newDecks = [...decks];
        newDecks[index] = { ...newDecks[index], [field]: value };
        setDecks(newDecks);
    };

    const addCard = async (deckIndex: number) => {
        setDecks((prev) => {
            const newDecks = prev.map((deck, i) => {
                if (i === deckIndex) {
                    return {
                        ...deck,
                        cards: [...deck.cards, { front: '', back: '', tags: [] }]
                    };
                }
                return deck;
            });
            setTimeout(() => {
                const cardKey = `${deckIndex}-${newDecks[deckIndex].cards.length - 1}`;
                if (cardRefs.current[cardKey]) {
                    cardRefs.current[cardKey]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
            return newDecks;
        });
        await refetch();
    };
    const removeCard = async (deckIndex: number, cardIndex: number) => {
        const cardToDelete = decks[deckIndex].cards[cardIndex];
        const cardId = cardToDelete._id;

        setDecks((prev) => {
            const newDecks = [...prev];
            newDecks[deckIndex].cards = newDecks[deckIndex].cards.filter((_, i) => i !== cardIndex);
            return newDecks;
        });
        getToast('success', 'Card removed');

        if (cardId) {
            try {
                await deleteCardMutation.mutateAsync({ cardId });
            } catch (err) {
                console.error(err);
                getToast('error', 'Failed to delete card from backend');
            }
        }
    };
    const updateCard = (deckIndex: number, cardIndex: number, field: keyof CardData, value: any) => {
        const newDecks = [...decks];
        newDecks[deckIndex].cards[cardIndex] = { ...newDecks[deckIndex].cards[cardIndex], [field]: value };
        setDecks(newDecks);
    };

    // --- Tags ---
    const addTag = (deckIndex: number, cardIndex: number, tag: string) => {
        if (!tag.trim()) return;
        const newDecks = [...decks];
        const card = newDecks[deckIndex].cards[cardIndex];
        if (!card.tags.includes(tag.trim())) card.tags.push(tag.trim());
        setDecks(newDecks);
        setNewTagInputs({ ...newTagInputs, [`${deckIndex}-${cardIndex}`]: '' });
    };
    const removeTag = (deckIndex: number, cardIndex: number, tagIndex: number) => {
        const newDecks = [...decks];
        newDecks[deckIndex].cards[cardIndex].tags = newDecks[deckIndex].cards[cardIndex].tags.filter(
            (_, i) => i !== tagIndex
        );
        setDecks(newDecks);
    };

    const handleSubmit = () => {
        if (!title.trim()) return getToast('error', 'Please enter a MOOC title');
        if (!moocId) return;

        const payload = {
            title,
            description: description || undefined,
            decks: decks.map((d) => ({
                deck: d._id,
                name: d.name,
                description: d.description || undefined,
                order: d.order,
                cards: d.cards.map((c) => ({
                    ...(c._id ? { _id: c._id } : {}),
                    front: c.front,
                    back: c.back,
                    tags: c.tags.length ? c.tags : undefined
                }))
            })),
            isPaid,
            price: isPaid ? Number.parseFloat(price) : undefined,
            currency: isPaid ? currency : undefined,
            publicStatus: isPublic ? 2 : 0,
            locked
        };

        updateMoocMutation.mutate(
            { moocId, payload },
            {
                onSuccess: async () => {
                    getToast('success', 'MOOC updated successfully!');
                    // Không cần await refetch ở đây, chỉ navigate(-1) để quay lại ngay
                    navigate(-1);
                },
                onError: (err: any) => {
                    console.error(err?.response?.data || err?.message || err);
                    getToast('error', 'Failed to update MOOC');
                }
            }
        );
    };

    return (
        <div className='min-h-screen flex items-center justify-center p-6'>
            <Card className='w-full max-w-4xl shadow-2xl border-border'>
                <div className='p-8 space-y-8'>
                    <h1 className='text-3xl font-bold text-center'>Update MOOC</h1>

                    {/* Title & Description */}
                    <div>
                        <Label>MOOC Title</Label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div>
                        <Label>Description</Label>
                        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>

                    {/* Paid / Public */}
                    <div className='space-y-6 p-6 rounded-lg bg-card/50 border border-border'>
                        <div className='flex items-center justify-between'>
                            <Label htmlFor='isPaid'>Paid MOOC</Label>
                            <Switch id='isPaid' checked={isPaid} onCheckedChange={setIsPaid} />
                        </div>
                        {isPaid && (
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4'>
                                <div>
                                    <Label htmlFor='price'>Price</Label>
                                    <Input
                                        type='number'
                                        min='0'
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor='currency'>Currency</Label>
                                    <Select value={currency} onValueChange={setCurrency}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select currency' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='VND'>VND</SelectItem>
                                            <SelectItem value='USD'>USD</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                        <div className='flex items-center justify-between mt-4 border-t pt-4'>
                            <Label htmlFor='isPublic'>Public</Label>
                            <Switch id='isPublic' checked={isPublic} onCheckedChange={setIsPublic} />
                        </div>
                        <div className='flex items-center justify-between border-t pt-4'>
                            <Label className='font-semibold'>Lock MOOC</Label>
                            <Switch checked={locked} onCheckedChange={setLocked} />
                        </div>
                    </div>

                    {/* Decks */}
                    <div className='space-y-4'>
                        <div className='flex items-center justify-between'>
                            <Label className='text-lg font-semibold'>Decks</Label>
                            <Button size='sm' variant='outline' onClick={addDeck}>
                                <Plus className='w-4 h-4 mr-1' /> Add Deck
                            </Button>
                        </div>
                        {decks.length === 0 ? (
                            <p className='text-muted-foreground text-center py-4'>
                                No decks found. Click "Add Deck" to create one.
                            </p>
                        ) : (
                            decks.map((deck, deckIndex) => (
                                <Card
                                    key={deckIndex}
                                    className='p-4 space-y-4 relative'
                                    ref={(el) => {
                                        deckRefs.current[deckIndex] = el;
                                    }}
                                >
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        className='absolute top-2 right-2'
                                        onClick={() => removeDeck(deckIndex)}
                                    >
                                        <Trash2 className='w-4 h-4 text-destructive' />
                                    </Button>

                                    <div>
                                        <Label>Deck Name</Label>
                                        <Input
                                            value={deck.name}
                                            onChange={(e) => updateDeck(deckIndex, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label>Deck Description</Label>
                                        <Textarea
                                            value={deck.description}
                                            onChange={(e) => updateDeck(deckIndex, 'description', e.target.value)}
                                        />
                                    </div>

                                    {/* Cards */}
                                    <div className='space-y-2'>
                                        <div className='flex items-center justify-between'>
                                            <Label>Cards</Label>
                                            <Button size='sm' variant='outline' onClick={() => addCard(deckIndex)}>
                                                <Plus className='w-4 h-4 mr-1' /> Add Card
                                            </Button>
                                        </div>
                                        {deck.cards.length === 0 ? (
                                            <p className='text-sm text-muted-foreground'>
                                                No cards yet. Click "Add Card" to create one.
                                            </p>
                                        ) : (
                                            deck.cards.map((card, cardIndex) => (
                                                <Card
                                                    key={cardIndex}
                                                    className='p-3 space-y-2 relative bg-muted/30'
                                                    ref={(el) => {
                                                        cardRefs.current[`${deckIndex}-${cardIndex}`] = el;
                                                    }}
                                                >
                                                    <Button
                                                        variant='ghost'
                                                        size='icon'
                                                        className='absolute top-1 right-1'
                                                        onClick={() => removeCard(deckIndex, cardIndex)}
                                                    >
                                                        <X className='w-4 h-4 text-destructive' />
                                                    </Button>
                                                    <Input
                                                        placeholder='Front'
                                                        value={card.front}
                                                        onChange={(e) =>
                                                            updateCard(deckIndex, cardIndex, 'front', e.target.value)
                                                        }
                                                    />
                                                    <Input
                                                        placeholder='Back'
                                                        value={card.back}
                                                        onChange={(e) =>
                                                            updateCard(deckIndex, cardIndex, 'back', e.target.value)
                                                        }
                                                    />
                                                    <div className='flex gap-2 flex-wrap mt-1'>
                                                        {card.tags.map((tag, tagIndex) => (
                                                            <Badge
                                                                key={tagIndex}
                                                                onClick={() =>
                                                                    removeTag(deckIndex, cardIndex, tagIndex)
                                                                }
                                                            >
                                                                {tag} <X className='w-3 h-3 ml-1' />
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                    <div className='flex gap-2 mt-1'>
                                                        <Input
                                                            placeholder='Add tag'
                                                            value={newTagInputs[`${deckIndex}-${cardIndex}`] || ''}
                                                            onChange={(e) =>
                                                                setNewTagInputs({
                                                                    ...newTagInputs,
                                                                    [`${deckIndex}-${cardIndex}`]: e.target.value
                                                                })
                                                            }
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    addTag(
                                                                        deckIndex,
                                                                        cardIndex,
                                                                        newTagInputs[`${deckIndex}-${cardIndex}`] || ''
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        <Button
                                                            size='sm'
                                                            variant='outline'
                                                            onClick={() =>
                                                                addTag(
                                                                    deckIndex,
                                                                    cardIndex,
                                                                    newTagInputs[`${deckIndex}-${cardIndex}`] || ''
                                                                )
                                                            }
                                                        >
                                                            <Plus className='w-4 h-4' />
                                                        </Button>
                                                    </div>
                                                </Card>
                                            ))
                                        )}
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Submit */}
                    <div className='flex gap-4'>
                        <Button variant='outline' className='flex-1' onClick={() => navigate(-1)}>
                            Cancel
                        </Button>
                        <Button className='flex-1' onClick={handleSubmit}>
                            {updateMoocMutation.isPending ? 'Updating...' : 'Update MOOC'}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};
