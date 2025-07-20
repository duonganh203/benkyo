import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { getToast } from '@/utils/getToast';
import { DeckToAddClassResponseDto } from '@/types/class';
import useAddDeckToClass from '@/hooks/queries/use-add-deck-to-class';

type AddDeckDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    classId: string;
    existingDecks: DeckToAddClassResponseDto[];
    onAddSuccess: () => void;
};

const AddDeckDialog = ({ open, onOpenChange, classId, existingDecks, onAddSuccess }: AddDeckDialogProps) => {
    const [mode, setMode] = useState('extra');
    const [selectedDeckId, setSelectedDeckId] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const { mutateAsync: addDeck } = useAddDeckToClass();

    const handleAdd = async () => {
        if (!selectedDeckId) return;
        const payload = {
            classId,
            deckId: selectedDeckId,
            description: mode === 'schedule' ? description : undefined,
            startTime: mode === 'schedule' ? new Date(startTime) : undefined,
            endTime: mode === 'schedule' ? new Date(endTime) : undefined
        };
        try {
            await addDeck(payload);
            getToast('success', 'Deck added successfully');
            onOpenChange(false);
            await onAddSuccess();
            setSelectedDeckId('');
            setDescription('');
            setStartTime('');
            setEndTime('');
        } catch {
            getToast('error', 'Failed to add deck');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                    <DialogTitle>Add Deck</DialogTitle>
                </DialogHeader>
                <div className='space-y-4'>
                    <Label>Choose Mode</Label>
                    <Select value={mode} onValueChange={setMode}>
                        <SelectTrigger className='cursor-pointer'>
                            <SelectValue placeholder='Select mode' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='extra' className='cursor-pointer'>
                                Extra Practice
                            </SelectItem>
                            <SelectItem value='schedule' className='cursor-pointer'>
                                Scheduled Learning
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Label>Select Deck</Label>
                    <Select value={selectedDeckId} onValueChange={setSelectedDeckId}>
                        <SelectTrigger className='w-full min-w-[20rem]'>
                            <SelectValue placeholder='Choose deck' />
                        </SelectTrigger>
                        <SelectContent className='min-w-[20rem]'>
                            {Array.isArray(existingDecks) && existingDecks.length > 0 ? (
                                existingDecks.map(({ _id, name, description }) => (
                                    <SelectItem key={_id} value={_id} className='cursor-pointer'>
                                        <div className='flex flex-col w-full'>
                                            <span className='font-medium truncate'>{name}</span>
                                            {description && (
                                                <span className='text-xs text-muted-foreground line-clamp-1'>
                                                    {description}
                                                </span>
                                            )}
                                        </div>
                                    </SelectItem>
                                ))
                            ) : (
                                <div className='p-2 text-sm text-muted-foreground text-center'>
                                    No decks available to add.
                                    <br />
                                    <Link to='/my-decks' className='text-primary underline'>
                                        Go to My Decks
                                    </Link>
                                </div>
                            )}
                        </SelectContent>
                    </Select>

                    {mode === 'schedule' && (
                        <>
                            <Label>Description</Label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder='Enter description'
                            />
                            <Label>Start Time</Label>
                            <Input
                                type='datetime-local'
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                            <Label>End Time</Label>
                            <Input type='datetime-local' value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                        </>
                    )}
                    <Button className='w-full' onClick={handleAdd}>
                        Add
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AddDeckDialog;
