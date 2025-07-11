import { useState } from 'react';
import { Book, Search } from 'lucide-react';
import { DeckInterface } from '@/types/deck';
import useGetPublicDecks from '@/hooks/queries/use-get-public-deck';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import Deck from '@/components/deck';

const Community = () => {
    const [search, setSearch] = useState('');
    const { data: decks = [], isLoading } = useGetPublicDecks();

    const filteredDecks = decks.filter(
        (deck: DeckInterface) =>
            deck.name.toLowerCase().includes(search.toLowerCase()) ||
            deck.description?.toLowerCase().includes(search.toLowerCase())
        // deck.owner?.email?.toLowerCase().includes(search.toLowerCase())
    );
    return (
        <div className='max-w-7xl mx-auto py-8 px-4'>
            <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8'>
                <h1 className='text-3xl font-bold flex items-center gap-2 text-foreground'>
                    <Book className='h-8 w-8 text-primary' />
                    Community
                </h1>

                <div className='relative w-full md:w-64 mt-2 md:mt-0'>
                    <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                    <Input
                        placeholder='Search decks...'
                        className='pl-8'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                    {Array(16)
                        .fill(0)
                        .map((_, i) => (
                            <Card key={i} className='overflow-hidden h-64'>
                                <Skeleton className='h-full w-full' />
                            </Card>
                        ))}
                </div>
            ) : filteredDecks.length === 0 ? (
                <div className='text-center py-16'>
                    <div className='mb-4 flex justify-center'>
                        <Book className='h-16 w-16 text-primary/60' />
                    </div>
                    <h2 className='text-2xl font-semibold mb-2 text-foreground'>No decks found</h2>
                    <p className='text-muted-foreground'>
                        {search ? 'No decks match your search' : 'There are no decks to display.'}
                    </p>
                </div>
            ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                    {filteredDecks.map((deck: DeckInterface) => (
                        <Deck key={deck._id} deck={deck} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Community;
