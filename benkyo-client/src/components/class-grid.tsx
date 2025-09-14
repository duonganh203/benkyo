import { Link } from 'react-router-dom';

import { ClassListItemUserResponseDto } from '@/types/class';

import ClassCard from '@/components/class-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type ClassGridProps = {
    title: string;
    items: ClassListItemUserResponseDto[];
    loading: boolean;
    onLoadMore: () => void;
    hasMore: boolean;
    variant: 'my-class' | 'suggested';
};

const ClassGrid = ({ title, items, loading, onLoadMore, hasMore, variant }: ClassGridProps) => (
    <div className='mb-12'>
        <div className='flex items-center justify-between py-3 px-1 border-b border-border mb-4'>
            <h2 className='text-xl font-semibold text-foreground pl-2'>{title}</h2>
        </div>

        {loading ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                {Array(3)
                    .fill(0)
                    .map((_, i) => (
                        <Card key={i} className='overflow-hidden h-64'>
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
                            {variant === 'my-class' ? (
                                <Link to={`/class/${classItem._id}`} className='cursor-pointer block'>
                                    <ClassCard classItem={classItem} index={i} variant={variant} />
                                </Link>
                            ) : (
                                <div>
                                    <ClassCard classItem={classItem} index={i} variant={variant} />
                                </div>
                            )}
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

export default ClassGrid;
