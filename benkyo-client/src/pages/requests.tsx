import { useState } from 'react';
import { Book, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { DeckInterface } from '@/types/deck';
import useGetUserPublicDecks from '@/hooks/queries/use-get-user-request-deck';
import Deck from '@/components/deck';

const Requests = () => {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const { data: decks = [] } = useGetUserPublicDecks();

    const filteredDecks = (decks as DeckInterface[]).filter((deck) => {
        const matchesSearch =
            deck.name.toLowerCase().includes(search.toLowerCase()) ||
            deck.description?.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'pending' && deck.publicStatus === 1) ||
            (statusFilter === 'approved' && deck.publicStatus === 2) ||
            (statusFilter === 'rejected' && deck.publicStatus === 3);

        return matchesSearch && matchesStatus;
    });

    return (
        <div className='max-w-7xl mx-auto py-8 px-4'>
            <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8'>
                <h1 className='text-3xl font-bold flex items-center gap-2 text-foreground'>
                    <Book className='h-8 w-8 text-primary' />
                    My Requests
                </h1>

                <div className='flex gap-3 w-full md:w-auto'>
                    <div className='relative w-full md:w-64'>
                        <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                        <Input
                            placeholder='Search requests...'
                            className='pl-8'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className='w-[160px]'>
                            <SelectValue placeholder='Filter by status' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='all'>All</SelectItem>
                            <SelectItem value='pending'>Pending</SelectItem>
                            <SelectItem value='approved'>Approved</SelectItem>
                            <SelectItem value='rejected'>Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                {filteredDecks.map((deck) => (
                    <Deck key={deck._id} deck={deck} showStatus={true} />
                ))}
            </div>
        </div>
    );
};

export default Requests;
