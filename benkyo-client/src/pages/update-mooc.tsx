import { useState, useEffect, useRef } from 'react';
import { Plus, X, Trash2, Eye } from 'lucide-react';
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
import { useGetAllDeckCards } from '@/hooks/queries/use-get-all-card-in-class';
import useDeleteCard from '@/hooks/queries/use-delete-card';
import useDeleteDeck from '@/hooks/queries/use-delete-deck';
import useGetDeckToAddClass from '@/hooks/queries/use-get-decks-to-class';
import { getDeckCards } from '@/api/deckApi';

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

    const { data: mooc, isLoading: moocLoading } = useGetMoocDetail(moocId!);

    const updateMoocMutation = useUpdateMooc();
    const deleteCardMutation = useDeleteCard();

    // dùng classId từ mooc sau khi đã load
    const { data: availableDecks } = useGetDeckToAddClass(mooc?.class as string);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPaid, setIsPaid] = useState(false);
    const [isPublic, setIsPublic] = useState(true);
    const [price, setPrice] = useState('');
    const [currency, setCurrency] = useState('VND');

    const [decks, setDecks] = useState<DeckData[]>([]);
    const [newTagInputs, setNewTagInputs] = useState<{ [key: string]: string }>({});
    const [deckSearch, setDeckSearch] = useState('');

    const deckRefs = useRef<Array<HTMLDivElement | null>>([]);
    const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    if (moocLoading) return <p className='text-center py-10'>Loading MOOC data...</p>;
    if (!mooc) return <p className='text-center py-10'>MOOC not found.</p>;

    /** ======================
     *  Get deck IDs & Fetch cards
     *  ===================== */
    const deckIds = (mooc?.decks || [])
        .map((d: any) => d.deck ?? d)
        .filter((deck: any) => deck && deck._id)
        .map((deck: any) => deck._id);
    const deleteDeckMutation = useDeleteDeck(deckIds!);
    const deckQueries = useGetAllDeckCards(deckIds);

    /** Khi tất cả deckCards được load hoàn chỉnh */
    const allLoaded = deckQueries.length === deckIds.length && deckQueries.every((q) => q.data);

    /** ======================
     *  Init Data 1 lần duy nhất khi mooc và deckCards đã load
     *  ===================== */
    useEffect(() => {
        if (!mooc || !allLoaded) return;

        const mergedDecks: DeckData[] = mooc.decks.map((deckWrapper: any, index: number) => {
            const deck = deckWrapper.deck ?? deckWrapper;

            return {
                _id: deck._id,
                name: deck.name || '',
                description: deck.description || '',
                order: deckWrapper.order ?? index,
                cards: deckQueries[index]?.data || []
            };
        });

        setDecks(mergedDecks);
        setTitle(mooc.title || '');
        setDescription(mooc.description || '');
        setIsPaid(!!mooc.isPaid);
        setPrice(mooc.price?.toString() || '');
        setCurrency(mooc.currency || 'VND');
        setIsPublic(mooc.publicStatus === 2);
    }, [mooc, allLoaded]);

    /** ======================
     *  Deck CRUD
     *  ===================== */
    const addDeck = () => {
        setDecks((prev) => {
            const newDecks = [...prev, { name: '', description: '', order: prev.length, cards: [] }];
            // scroll sau khi DOM render
            setTimeout(() => {
                const lastIndex = newDecks.length - 1;
                const el = deckRefs.current[lastIndex];
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100); // 100ms đủ để DOM render
            return newDecks;
        });
    };

    const removeDeck = async (deckIndex: number) => {
        const target = decks[deckIndex];

        // Xóa local nếu deck chưa có _id
        if (!target._id) {
            setDecks((prev) => prev.filter((_, i) => i !== deckIndex));
            return getToast('success', 'Deck removed locally');
        }

        try {
            await deleteDeckMutation.mutateAsync({ deckId: target._id });
            setDecks((prev) => prev.filter((_, i) => i !== deckIndex));
            getToast('success', 'Deck deleted');
        } catch {
            getToast('error', 'Failed to delete deck');
        }
    };

    const updateDeck = (idx: number, field: keyof DeckData, val: any) => {
        setDecks((prev) => prev.map((d, i) => (i === idx ? { ...d, [field]: val } : d)));
    };

    /** ======================
     *  Card CRUD
     *  ===================== */
    const addCard = (deckIndex: number) => {
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

            // scroll tới card mới
            setTimeout(() => {
                const cardKey = `${deckIndex}-${newDecks[deckIndex].cards.length - 1}`;
                const el = cardRefs.current[cardKey];
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);

            return newDecks;
        });
    };

    const removeCard = async (deckIndex: number, cardIndex: number) => {
        const card = decks[deckIndex].cards[cardIndex];

        setDecks((prev) =>
            prev.map((d, i) => (i === deckIndex ? { ...d, cards: d.cards.filter((_, ci) => ci !== cardIndex) } : d))
        );

        if (card._id) {
            try {
                await deleteCardMutation.mutateAsync({ cardId: card._id });
            } catch {
                getToast('error', 'Failed to delete card');
            }
        }
    };

    const updateCard = (deckIdx: number, cardIdx: number, field: keyof CardData, val: any) => {
        setDecks((prev) =>
            prev.map((d, i) =>
                i === deckIdx
                    ? {
                          ...d,
                          cards: d.cards.map((c, ci) => (ci === cardIdx ? { ...c, [field]: val } : c))
                      }
                    : d
            )
        );
    };

    /** ======================
     *  Tags
     *  ===================== */
    const addTag = (deckIdx: number, cardIdx: number, tag: string) => {
        if (!tag.trim()) return;

        setDecks((prev) =>
            prev.map((d, i) =>
                i === deckIdx
                    ? {
                          ...d,
                          cards: d.cards.map((c, ci) =>
                              ci === cardIdx && !c.tags.includes(tag.trim())
                                  ? { ...c, tags: [...c.tags, tag.trim()] }
                                  : c
                          )
                      }
                    : d
            )
        );

        setNewTagInputs((prev) => ({
            ...prev,
            [`${deckIdx}-${cardIdx}`]: ''
        }));
    };

    const removeTag = (deckIdx: number, cardIdx: number, tagIdx: number) => {
        updateCard(
            deckIdx,
            cardIdx,
            'tags',
            decks[deckIdx].cards[cardIdx].tags.filter((_, i) => i !== tagIdx)
        );
    };

    const handleSelectImportDeck = async (deckIndex: number, deckId: string) => {
        try {
            const cards = await getDeckCards(deckId);
            const mappedCards = cards.map((c: any) => ({
                // không có _id => backend hiểu là card mới
                front: c.front,
                back: c.back,
                tags: c.tags ?? []
            }));

            setDecks((prev) => {
                const next = [...prev];
                const existing = next[deckIndex]?.cards || [];

                const existingSet = new Set(existing.map((c) => `${c.front.trim()}:::${c.back.trim()}`));
                const uniqueImported = mappedCards.filter(
                    (c) => !existingSet.has(`${c.front.trim()}:::${c.back.trim()}`)
                );

                next[deckIndex] = {
                    ...next[deckIndex],
                    cards: [...existing, ...uniqueImported]
                };
                return next;
            });

            getToast('success', 'Imported cards from selected deck');
        } catch (error: any) {
            getToast('error', error?.message || 'Failed to import cards from deck');
        }
    };

    /** ======================
     *  Submit
     *  ===================== */
    const handleSubmit = () => {
        if (!title.trim()) return getToast('error', 'Please enter a MOOC title');
        if (!moocId) return;

        const payload = {
            title,
            description: description || undefined,
            isPaid,
            price: isPaid ? Number(price) : undefined,
            currency: isPaid ? currency : undefined,
            publicStatus: isPublic ? 2 : 0,

            decks: decks.map((d) => ({
                deck: d._id,
                name: d.name,
                description: d.description || undefined,
                order: d.order,
                cards: d.cards.map((c) => ({
                    ...(c._id ? { _id: c._id } : {}),
                    front: c.front,
                    back: c.back,
                    tags: c.tags
                }))
            }))
        };

        updateMoocMutation.mutate(
            { moocId, payload },
            {
                onSuccess: () => {
                    getToast('success', 'MOOC updated!');
                    navigate(-1);
                },
                onError: () => getToast('error', 'Failed to update MOOC')
            }
        );
    };

    /** ======================
     *  UI
     *  ===================== */
    return (
        <div className='min-h-screen flex items-center justify-center p-6'>
            <Card className='w-full max-w-4xl shadow-2xl border-border'>
                <div className='p-8 space-y-8'>
                    <h1 className='text-3xl font-bold text-center'>Update MOOC</h1>

                    <div>
                        <Label>MOOC Title</Label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>

                    <div>
                        <Label>Description</Label>
                        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>

                    {/* Switches */}
                    <div className='space-y-6 p-6 rounded-lg bg-card/50 border'>
                        <div className='flex items-center justify-between'>
                            <Label>Paid MOOC</Label>
                            <Switch checked={isPaid} onCheckedChange={setIsPaid} />
                        </div>

                        {isPaid && (
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <Label>Price</Label>
                                    <Input
                                        type='number'
                                        min='0'
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>Currency</Label>
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

                        <div className='flex items-center justify-between pt-4 border-t'>
                            <Label>Public</Label>
                            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                        </div>
                    </div>

                    {/* Decks */}
                    <div className='space-y-4'>
                        <div className='flex items-center justify-between'>
                            <Label className='text-lg font-semibold'>Decks</Label>
                            <Button variant='outline' onClick={addDeck}>
                                <Plus className='w-4 h-4 mr-1' /> Add Deck
                            </Button>
                        </div>

                        {decks.map((deck, deckIndex) => (
                            <Card
                                key={deckIndex}
                                ref={(el) => {
                                    deckRefs.current[deckIndex] = el;
                                }}
                                className='p-4 space-y-4 relative'
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

                                <div className='space-y-1 pt-1'>
                                    <Label className='text-sm font-medium'>Import from existing deck (optional)</Label>
                                    <p className='text-xs text-muted-foreground'>
                                        You can copy cards from an existing class deck, then edit them below.
                                    </p>
                                    <Select
                                        value=''
                                        onValueChange={(deckId) => handleSelectImportDeck(deckIndex, deckId)}
                                    >
                                        <SelectTrigger className='w-56'>
                                            <SelectValue placeholder='Choose deck to import from' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <div className='p-2 pb-1 border-b border-border'>
                                                <Input
                                                    placeholder='Search deck...'
                                                    value={deckSearch}
                                                    onChange={(e) => setDeckSearch(e.target.value)}
                                                    autoFocus
                                                />
                                            </div>
                                            {availableDecks && availableDecks.length > 0 ? (
                                                availableDecks
                                                    .filter((d) =>
                                                        d.name.toLowerCase().includes(deckSearch.toLowerCase())
                                                    )
                                                    .map((d) => (
                                                        <SelectItem
                                                            key={d._id}
                                                            value={d._id}
                                                            className='max-w-60 p-0 cursor-pointer'
                                                        >
                                                            <div className='flex items-center w-60'>
                                                                <span className='pl-2 truncate flex-1'>{d.name}</span>
                                                                <Button
                                                                    variant='ghost'
                                                                    size='icon'
                                                                    className='p-0 ml-auto relative'
                                                                    onMouseDown={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        window.open(`/deck/${d._id}`, '_blank');
                                                                    }}
                                                                >
                                                                    <Eye className='w-4 h-4' />
                                                                </Button>
                                                            </div>
                                                        </SelectItem>
                                                    ))
                                            ) : (
                                                <div className='px-2 py-1 text-sm text-muted-foreground'>
                                                    No decks available to import
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {deck.cards.length > 0 && (
                                        <p className='text-xs text-muted-foreground'>
                                            Total cards: {deck.cards.length}
                                        </p>
                                    )}
                                </div>

                                {/* Cards */}
                                <div>
                                    <div className='flex items-center justify-between'>
                                        <Label>Cards</Label>
                                        <Button variant='outline' onClick={() => addCard(deckIndex)}>
                                            <Plus className='w-4 h-4 mr-1' /> Add Card
                                        </Button>
                                    </div>

                                    {deck.cards.map((card, cardIndex) => (
                                        <Card
                                            key={cardIndex}
                                            ref={(el) => {
                                                cardRefs.current[`${deckIndex}-${cardIndex}`] = el;
                                            }}
                                            className='p-3 mt-2 relative bg-muted/30'
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

                                            <div className='flex flex-wrap gap-2 mt-2'>
                                                {card.tags.map((tag, tagIndex) => (
                                                    <Badge
                                                        key={tagIndex}
                                                        onClick={() => removeTag(deckIndex, cardIndex, tagIndex)}
                                                    >
                                                        {tag} <X className='h-3 w-3 ml-1' />
                                                    </Badge>
                                                ))}
                                            </div>

                                            <div className='flex gap-2 mt-2'>
                                                <Input
                                                    placeholder='Add tag'
                                                    value={newTagInputs[`${deckIndex}-${cardIndex}`] || ''}
                                                    onChange={(e) =>
                                                        setNewTagInputs((prev) => ({
                                                            ...prev,
                                                            [`${deckIndex}-${cardIndex}`]: e.target.value
                                                        }))
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
                                    ))}
                                </div>
                            </Card>
                        ))}
                    </div>

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
