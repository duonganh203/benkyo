import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, School, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

import useAuthStore from '@/hooks/stores/use-auth-store';
import useGetMyClass from '@/hooks/queries/use-get-my-class';
import useGetSuggestedClass from '@/hooks/queries/use-get-suggested-class';

import { Input } from '@/components/ui/input';
import ClassGrid from '@/components/class-grid';
import { getToast } from '@/utils/getToast';

const ClassList = () => {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuthStore((store) => store);

    if (!user) {
        navigate('/login');
        getToast('error', 'You must be logged in to continue.');
    }

    const {
        data: myClassPages,
        fetchNextPage: fetchNextMyClass,
        hasNextPage: hasMoreMyClass,
        isLoading: isLoadingMyClass,
        isError: isMyClassError,
        error: myClassError
    } = useGetMyClass(searchTerm);
    if (isMyClassError) {
        getToast('error', `${myClassError.message}`);
        console.log(myClassError);
    }

    const {
        data: suggestedClassPages,
        fetchNextPage: fetchNextSuggested,
        hasNextPage: hasMoreSuggested,
        isLoading: isLoadingSuggested
    } = useGetSuggestedClass(searchTerm);

    const myClasses = myClassPages?.pages.flatMap((p) => p.data) ?? [];
    const suggestedClasses = suggestedClassPages?.pages.flatMap((p) => p.data) ?? [];

    return (
        <div className='min-h-screen flex flex-col items-center'>
            <div className='container px-4 py-8'>
                <div className='flex items-center justify-between mb-6'>
                    <div className='flex gap-2 items-center'>
                        <School className='h-8 w-8 text-primary' />
                        <h1 className=' text-3xl font-bold text-foreground'>Classes</h1>
                    </div>
                    <div className='flex items-center gap-4'>
                        <div className='relative'>
                            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
                            <Input
                                type='text'
                                placeholder='Search classes...'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className='pl-10 w-80'
                            />
                        </div>
                        {user?.isPro && (
                            <Button asChild>
                                <Link
                                    to='/class/create'
                                    className='inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md'
                                >
                                    <Plus className='w-4 h-4' />
                                    Create Class
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <ClassGrid
                    title='Your Classes'
                    items={myClasses}
                    loading={isLoadingMyClass}
                    onLoadMore={fetchNextMyClass}
                    hasMore={hasMoreMyClass ?? false}
                    variant='my-class'
                />

                <ClassGrid
                    title='Suggested Classes'
                    items={suggestedClasses}
                    loading={isLoadingSuggested}
                    onLoadMore={fetchNextSuggested}
                    hasMore={hasMoreSuggested ?? false}
                    variant='suggested'
                />
            </div>
        </div>
    );
};

export default ClassList;
