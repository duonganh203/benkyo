import { useState } from 'react';
import { Book, Plus, Trash2, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import ConfirmDeleteDeckModal from '@/components/modals/confirm-delete-deck-modal';
import useClassManagementStore from '@/hooks/stores/use-class-management-store';
import useAddDeckToClass from '@/hooks/queries/use-add-deck-to-class';
import useRemoveDeckFromClass from '@/hooks/queries/use-remove-deck-from-class';
import useGetClassDeck from '@/hooks/queries/use-get-class-deck';
import useGetDeckToAddClass from '@/hooks/queries/use-get-decks-to-class';
import { getToast } from '@/utils/getToast';

interface ClassDeckProps {
    onDeckChange?: () => void;
}

export const ClassDeck = ({ onDeckChange }: ClassDeckProps) => {
    const { classData } = useClassManagementStore();
    const [selectedDeckId, setSelectedDeckId] = useState('');
    const [addMode, setAddMode] = useState<'practice' | 'scheduled'>('practice');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [deckToRemove, setDeckToRemove] = useState<string | null>(null);

    const { data: decks, isLoading, error, refetch } = useGetClassDeck(classData?._id || '');
    const { data: availableDecks } = useGetDeckToAddClass(classData?._id || '');

    const { mutateAsync: addDeck } = useAddDeckToClass();
    const { mutateAsync: removeDeck } = useRemoveDeckFromClass();

    const handleAddDeck = async () => {
        if (!selectedDeckId) {
            getToast('error', 'Please select a deck');
            return;
        }

        if (!classData?._id) {
            getToast('error', 'Class data not available');
            return;
        }

        setIsAdding(true);
        try {
            const deckData: any = {
                classId: classData._id,
                deckId: selectedDeckId
            };

            if (addMode === 'scheduled') {
                if (!description.trim()) {
                    getToast('error', 'Please enter a description for scheduled learning');
                    return;
                }
                if (!startTime || !endTime) {
                    getToast('error', 'Please set start and end times for scheduled learning');
                    return;
                }
                deckData.description = description.trim();
                deckData.startTime = new Date(startTime);
                deckData.endTime = new Date(endTime);
            }

            await addDeck(deckData, {
                onSuccess: () => {
                    getToast('success', 'Deck added successfully');
                    setSelectedDeckId('');
                    setDescription('');
                    setStartTime('');
                    setEndTime('');
                    refetch();
                    onDeckChange?.();
                },
                onError: (error) => {
                    getToast('error', error.message);
                    console.log(error);
                }
            });
        } catch (error) {
            getToast('error', 'Failed to add deck');
            console.log(error);
        } finally {
            setIsAdding(false);
        }
    };

    const handleRemoveDeck = async (deckId: string) => {
        if (!classData?._id) {
            getToast('error', 'Class data not available');
            return;
        }

        setDeckToRemove(deckId);
        setShowConfirmModal(true);
    };

    const confirmRemoveDeck = async () => {
        if (!classData?._id || !deckToRemove) {
            return;
        }

        removeDeck(
            { classId: classData._id, deckId: deckToRemove },
            {
                onSuccess: () => {
                    getToast('success', 'Deck removed successfully');
                    refetch();
                    onDeckChange?.();
                    setShowConfirmModal(false);
                    setDeckToRemove(null);
                },
                onError: (error) => {
                    getToast('error', error.message);
                    console.log(error);
                }
            }
        );
    };

    if (!classData) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Book className='w-5 h-5' />
                        Decks
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='text-center py-8 text-muted-foreground'>No class data available</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Book className='w-5 h-5' />
                        Decks ({decks?.length || 0})
                    </CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <Label>Add Deck to Class</Label>
                            <div className='flex gap-2'>
                                <Select value={selectedDeckId} onValueChange={setSelectedDeckId}>
                                    <SelectTrigger className='flex-1'>
                                        <SelectValue placeholder='Select a deck to add' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableDecks?.map((deck: any) => (
                                            <SelectItem key={deck._id} value={deck._id}>
                                                {deck.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className='flex gap-2'>
                            <Button
                                variant={addMode === 'practice' ? 'default' : 'outline'}
                                size='sm'
                                onClick={() => setAddMode('practice')}
                            >
                                Extra Practice
                            </Button>
                            <Button
                                variant={addMode === 'scheduled' ? 'default' : 'outline'}
                                size='sm'
                                onClick={() => setAddMode('scheduled')}
                            >
                                Scheduled Learning
                            </Button>
                        </div>

                        {addMode === 'scheduled' && (
                            <div className='space-y-4 p-4 bg-muted/30 rounded-lg border'>
                                <div className='space-y-2'>
                                    <Label htmlFor='description'>Description</Label>
                                    <Input
                                        id='description'
                                        placeholder='Enter learning description'
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='space-y-2'>
                                        <Label htmlFor='start-time'>Start Time</Label>
                                        <Input
                                            id='start-time'
                                            type='datetime-local'
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label htmlFor='end-time'>End Time</Label>
                                        <Input
                                            id='end-time'
                                            type='datetime-local'
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <Button onClick={handleAddDeck} disabled={isAdding || !selectedDeckId}>
                            <Plus className='w-4 h-4 mr-2' />
                            {isAdding ? 'Adding...' : 'Add Deck'}
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className='text-center py-8 text-muted-foreground'>Loading decks...</div>
                    ) : error ? (
                        <div className='text-center py-8 text-muted-foreground'>Error loading decks</div>
                    ) : !decks || decks.length === 0 ? (
                        <div className='text-center py-8 text-muted-foreground'>
                            <Book className='w-8 h-8 mx-auto mb-2 opacity-50' />
                            <p>No decks found</p>
                        </div>
                    ) : (
                        <div className='space-y-4'>
                            {decks.map((deck: any) => (
                                <div
                                    key={deck._id}
                                    className='flex items-center justify-between p-4 bg-muted/30 rounded-lg border'
                                >
                                    <div className='flex items-center gap-4 flex-1'>
                                        <div className='w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center'>
                                            <Book className='w-6 h-6 text-primary' />
                                        </div>
                                        <div className='flex-1 min-w-0'>
                                            <div className='font-medium text-foreground truncate'>
                                                {deck.deck?.name || 'Unknown Deck'}
                                            </div>
                                            <div className='text-sm text-muted-foreground truncate'>
                                                {deck.description || deck.deck?.description || 'No description'}
                                            </div>
                                            <div className='flex items-center gap-2 mt-1'>
                                                <Badge variant='outline' className='text-xs'>
                                                    {deck.deck?.cardCount || 0} cards
                                                </Badge>
                                                {deck.startTime && deck.endTime && (
                                                    <>
                                                        <Badge variant='secondary' className='text-xs'>
                                                            <Calendar className='w-3 h-3 mr-1' />
                                                            Scheduled
                                                        </Badge>
                                                        <Badge variant='outline' className='text-xs'>
                                                            <Clock className='w-3 h-3 mr-1' />
                                                            {new Date(deck.startTime).toLocaleDateString()} -{' '}
                                                            {new Date(deck.endTime).toLocaleDateString()}
                                                        </Badge>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        size='sm'
                                        variant='outline'
                                        className='border-red-300 text-red-600 hover:bg-red-50'
                                        onClick={() => handleRemoveDeck(deck.deck?._id)}
                                    >
                                        <Trash2 className='w-4 h-4 mr-1' />
                                        Remove
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <ConfirmDeleteDeckModal
                open={showConfirmModal}
                onClose={() => {
                    setShowConfirmModal(false);
                    setDeckToRemove(null);
                }}
                onConfirm={confirmRemoveDeck}
            />
        </>
    );
};
