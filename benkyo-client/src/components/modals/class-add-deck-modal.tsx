'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { getToast } from '@/utils/getToast';
import { DeckToAddClassResponseDto } from '@/types/class';
import useAddDeckToClass from '@/hooks/queries/use-add-deck-to-class';
import { format } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';

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
    const [startTime, setStartTime] = useState<Date | undefined>(undefined);
    const [endTime, setEndTime] = useState<Date | undefined>(undefined);
    const { mutateAsync: addDeck } = useAddDeckToClass();

    const handleAdd = async () => {
        if (!selectedDeckId) return getToast('error', 'Please select a deck');

        if (mode === 'schedule') {
            if (!startTime || !endTime) return getToast('error', 'Please select both start and end time');
            if (endTime <= startTime) return getToast('error', 'End time must be after start time');
        }

        try {
            await addDeck({
                classId,
                deckId: selectedDeckId,
                description: mode === 'schedule' ? description : undefined,
                startTime: mode === 'schedule' ? startTime : undefined,
                endTime: mode === 'schedule' ? endTime : undefined
            });
            getToast('success', 'Deck added successfully');
            onOpenChange(false);
            await onAddSuccess();
            setSelectedDeckId('');
            setDescription('');
            setStartTime(undefined);
            setEndTime(undefined);
        } catch {
            getToast('error', 'Failed to add deck');
        }
    };

    const isAddDisabled = !selectedDeckId || (mode === 'schedule' && (!startTime || !endTime || endTime <= startTime));

    const DateTimePicker = ({
        value,
        onChange,
        placeholder
    }: {
        value?: Date;
        onChange: (d?: Date) => void;
        placeholder: string;
    }) => {
        const [showPicker, setShowPicker] = React.useState(false);
        const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value);
        const [selectedTime, setSelectedTime] = React.useState(value ? format(value, 'HH:mm') : '');
        const [buttonRect, setButtonRect] = React.useState<DOMRect | null>(null);
        const buttonRef = React.useRef<HTMLButtonElement>(null);

        const handleDateSelect = (date: Date | undefined) => {
            if (date) {
                setSelectedDate(date);
                const timeStr = selectedTime || format(new Date(), 'HH:mm');
                const combined = new Date(`${format(date, 'yyyy-MM-dd')}T${timeStr}`);
                onChange(combined);
            }
        };

        const handleTimeChange = (timeStr: string) => {
            setSelectedTime(timeStr);
            if (selectedDate && timeStr) {
                const combined = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${timeStr}`);
                onChange(combined);
            }
        };

        const handleButtonClick = () => {
            if (buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                setButtonRect(rect);
            }
            setShowPicker(!showPicker);
        };

        const handleConfirm = () => {
            if (selectedDate && selectedTime) {
                const combined = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}`);
                onChange(combined);
            }
            setShowPicker(false);
        };

        const handleClear = () => {
            setSelectedDate(undefined);
            setSelectedTime('');
            onChange(undefined);
            setShowPicker(false);
        };

        React.useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (!showPicker) return;

                const target = event.target as Element;

                if (buttonRef.current && buttonRef.current.contains(target)) {
                    return;
                }

                if (target.closest('[data-datetime-portal]')) {
                    return;
                }

                if (target.closest('[role="dialog"]')) {
                    return;
                }

                setShowPicker(false);
            };

            const timeoutId = setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside, true);
            }, 100);

            return () => {
                clearTimeout(timeoutId);
                document.removeEventListener('mousedown', handleClickOutside, true);
            };
        }, [showPicker]);

        React.useEffect(() => {
            if (value) {
                setSelectedDate(value);
                setSelectedTime(format(value, 'HH:mm'));
            }
        }, [value]);

        const DateTimePortal = () => {
            if (!showPicker || !buttonRect) return null;

            return createPortal(
                <div
                    data-datetime-portal
                    className='fixed p-4 border rounded-xl shadow-2xl animate-in slide-in-from-bottom-2 duration-200 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur-md border-gray-600/50'
                    style={{
                        zIndex: 10000,
                        bottom: window.innerHeight - buttonRect.top + 8,
                        left: buttonRect.left,
                        minWidth: '320px',
                        maxWidth: '380px'
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className='mb-4 p-3 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-600 shadow-inner'>
                        <Calendar
                            mode='single'
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            className='rounded-md border'
                        />
                    </div>

                    <div className='mb-4'>
                        <Label className='text-xs text-gray-300 mb-3  items-center gap-2'>
                            <Clock className='h-4 w-4 text-purple-400' />
                            <span className='font-medium'>Time</span>
                        </Label>
                        <div className='relative'>
                            <Clock className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400' />
                            <Input
                                type='time'
                                value={selectedTime}
                                onChange={(e) => handleTimeChange(e.target.value)}
                                className='pl-10 bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600 focus:border-purple-400 focus:ring-purple-400/20 rounded-lg h-11 font-medium transition-all duration-200 hover:border-purple-500/50'
                            />
                        </div>
                    </div>

                    <div className='flex gap-3'>
                        <Button
                            variant='outline'
                            size='sm'
                            className='flex-1 border-gray-600 text-gray-300 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600 hover:border-gray-500 hover:text-white transition-all duration-200 rounded-lg h-10 font-medium'
                            onClick={handleClear}
                        >
                            Clear
                        </Button>
                        <Button
                            size='sm'
                            className='flex-1 bg-gradient-to-r from-purple-600 via-purple-700 to-blue-700 hover:from-purple-700 hover:via-purple-800 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg h-10 font-semibold hover:scale-105'
                            onClick={handleConfirm}
                            disabled={!selectedDate || !selectedTime}
                        >
                            Confirm
                        </Button>
                    </div>
                </div>,
                document.body
            );
        };

        return (
            <div className='space-y-2'>
                <Button
                    ref={buttonRef}
                    type='button'
                    variant='outline'
                    className={`w-full justify-start text-left font-normal h-10 ${
                        !value ? 'text-muted-foreground' : ''
                    } hover:bg-gradient-to-r  transition-all duration-200`}
                    onClick={handleButtonClick}
                >
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {value ? format(value, "MMM do, yyyy 'at' h:mm a") : placeholder}
                </Button>

                <DateTimePortal />

                {value && (
                    <div className='text-xs text-muted-foreground'>
                        {format(value, "EEEE, MMMM do, yyyy 'at' h:mm a")}
                    </div>
                )}
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
            <DialogContent
                className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-auto max-h-[85vh] rounded-lg border bg-background shadow-lg flex flex-col'
                onInteractOutside={(e) => {
                    const target = e.target as Element;
                    if (target?.closest('[data-calendar-portal]')) {
                        e.preventDefault();
                    }
                }}
            >
                <DialogHeader className='pb-3 border-b flex-shrink-0'>
                    <DialogTitle className='text-lg text-center'>Add Deck to Class</DialogTitle>
                </DialogHeader>

                <div className='space-y-4 py-4 px-4 flex-1 min-h-0 overflow-y-auto'>
                    <div className='space-y-2'>
                        <Label className='text-sm font-medium'>Choose Mode</Label>
                        <Select value={mode} onValueChange={setMode}>
                            <SelectTrigger className='cursor-pointer h-10'>
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
                    </div>

                    <div className='space-y-2'>
                        <Label className='text-sm font-medium'>Select Deck</Label>
                        <Select value={selectedDeckId} onValueChange={setSelectedDeckId}>
                            <SelectTrigger className='hover:cursor-pointer w-full min-w-[20rem] h-10'>
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
                                        No decks available.
                                        <br />
                                        <Link to='/my-decks' className='text-primary underline'>
                                            Go to My Decks
                                        </Link>
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {mode === 'schedule' && (
                        <div className='space-y-3 p-4 bg-muted/30 rounded-lg border'>
                            <div className='space-y-2'>
                                <Label className='text-sm font-medium'>Description</Label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder='Enter description'
                                    className='min-h-[50px] text-sm'
                                />
                            </div>
                            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Label className=' text-sm font-medium'>Start Date</Label>
                                    <DateTimePicker
                                        value={startTime}
                                        onChange={setStartTime}
                                        placeholder='Select start date'
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label className='text-sm font-medium'>End Date</Label>
                                    <DateTimePicker
                                        value={endTime}
                                        onChange={setEndTime}
                                        placeholder='Select end date'
                                    />
                                </div>
                            </div>
                            {startTime && endTime && endTime <= startTime && (
                                <div className='text-xs text-destructive bg-destructive/10 p-2 rounded border-l-2 border-destructive'>
                                    End time must be after start time
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className='pt-4 px-4 pb-4 border-t bg-background flex-shrink-0'>
                    <Button className='w-full h-11 text-base font-medium' onClick={handleAdd} disabled={isAddDisabled}>
                        Add Deck
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AddDeckDialog;
