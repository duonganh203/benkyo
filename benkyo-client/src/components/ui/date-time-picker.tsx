'use client';

import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export const DatePicker = ({ value, onChange }: { value?: Date; onChange: (d?: Date) => void }) => (
    <Popover>
        <PopoverTrigger asChild>
            <Button
                variant='outline'
                data-empty={!value}
                className='data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal'
            >
                <CalendarIcon className='mr-2 h-4 w-4' />
                {value ? format(value, 'PPP') : <span>Pick a date</span>}
            </Button>
        </PopoverTrigger>
        <PopoverContent forceMount className='z-[100] w-auto p-0' side='bottom' align='start'>
            <Calendar mode='single' selected={value} onSelect={(val) => val && onChange(val)} initialFocus />
        </PopoverContent>
    </Popover>
);
