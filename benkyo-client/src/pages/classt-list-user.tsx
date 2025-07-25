import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import useAuthStore from '@/hooks/stores/use-auth-store';
import useGetMyClass from '@/hooks/queries/use-get-my-class';
import { ClassListItemUserResponseDto } from '@/types/class';
import useGetSuggestedClass from '@/hooks/queries/use-get-suggested-class';
import ClassCard from '@/components/class-card';

const ClassListUser = () => {
    const { user } = useAuthStore((s) => s);

    const {
        data: myClassPages,
        fetchNextPage: fetchNextMyClass,
        hasNextPage: hasMoreMyClass,
        isLoading: isLoadingMyClass
    } = useGetMyClass();
    console.log('myClassPages', myClassPages);

    const {
        data: suggestedClassPages,
        fetchNextPage: fetchNextSuggested,
        hasNextPage: hasMoreSuggested,
        isLoading: isLoadingSuggested
    } = useGetSuggestedClass();

    const myClasses = myClassPages?.pages.flatMap((p) => p.data) ?? [];
    const suggestedClasses = suggestedClassPages?.pages.flatMap((p) => p.data) ?? [];

    const renderSection = (
        title: string,
        items: ClassListItemUserResponseDto[],
        loading: boolean,
        onLoadMore: () => void,
        hasMore: boolean,
        variant: 'my-class' | 'suggested'
    ) => (
        <div className='mb-12'>
            <div className='flex items-center justify-between py-3 px-1 border-b border-border mb-4'>
                <h2 className='text-xl font-semibold text-foreground pl-2'>{title}</h2>
            </div>

            {loading ? (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                    {Array(3)
                        .fill(0)
                        .map((_, i) => (
                            <Card key={i} className='overflow-hidden h-64 pl-4'>
                                <Skeleton className='h-full w-full' />
                            </Card>
                        ))}
                </div>
            ) : items.length === 0 ? (
                <p className='text-sm text-muted-foreground italic px-2 pl-2'>No classes available.</p>
            ) : (
                <>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                        {items.map((classItem, i) => (
                            <div key={classItem._id} className='pl-4'>
                                <Link to={`/class/${classItem._id}`} className='cursor-pointer block'>
                                    <ClassCard classItem={classItem} index={i} variant={variant} />
                                </Link>
                            </div>
                        ))}
                    </div>
                    {hasMore && (
                        <div className='mt-6 text-center'>
                            <Button onClick={onLoadMore}>Load more</Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );

    return (
        <div className='min-h-screen flex flex-col items-center'>
            <div className='container px-4 py-8'>
                <div className='flex items-center justify-between mb-6'>
                    <h1 className='text-3xl font-bold text-foreground'>Classes</h1>
                    {user?.isPro && (
                        <Link
                            to='/class/create'
                            className='inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-md hover:bg-primary/90 transition'
                        >
                            <Plus className='w-4 h-4' />
                            Create Class
                        </Link>
                    )}
                </div>

                {renderSection(
                    'Your Classes',
                    myClasses,
                    isLoadingMyClass,
                    fetchNextMyClass,
                    hasMoreMyClass ?? false,
                    'my-class'
                )}

                {renderSection(
                    'Suggested Classes',
                    suggestedClasses,
                    isLoadingSuggested,
                    fetchNextSuggested,
                    hasMoreSuggested ?? false,
                    'suggested'
                )}
            </div>
        </div>
    );
};

export default ClassListUser;
