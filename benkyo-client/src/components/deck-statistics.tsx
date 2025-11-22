import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import useGetDeckStats from '@/hooks/queries/use-get-deck-stats';

interface DeckStatisticsProps {
    deckId: string;
}

const COLORS = ['#3b82f6', '#eab308', '#22c55e', '#ef4444']; // Blue, Yellow, Green, Red

const DeckStatistics: React.FC<DeckStatisticsProps> = ({ deckId }) => {
    const { data: stats, isLoading, error } = useGetDeckStats(deckId);

    if (isLoading) {
        return (
            <div className='grid gap-4 md:grid-cols-2'>
                <Skeleton className='h-[300px] w-full' />
                <Skeleton className='h-[300px] w-full' />
            </div>
        );
    }

    if (error || !stats) {
        return <div className='text-center py-8 text-muted-foreground'>Failed to load statistics.</div>;
    }

    const pieData = [
        { name: 'New', value: stats.cardCounts.new },
        { name: 'Learning', value: stats.cardCounts.learning },
        { name: 'Review', value: stats.cardCounts.review },
        { name: 'Relearning', value: stats.cardCounts.relearning }
    ].filter((item) => item.value > 0);

    const barData = stats.reviewsLast30Days.map((item) => ({
        date: item._id.split('-').slice(1).join('/'), // Format MM/DD
        reviews: item.count
    }));

    return (
        <div className='space-y-6 animate-fade-in'>
            <div className='grid gap-4 md:grid-cols-3'>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-sm font-medium text-muted-foreground'>Total Cards</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>{stats.cardCounts.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-sm font-medium text-muted-foreground'>Retention Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>{stats.retentionRate.toFixed(1)}%</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-sm font-medium text-muted-foreground'>Total Reviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>{stats.totalReviews}</div>
                    </CardContent>
                </Card>
            </div>

            <div className='grid gap-6 md:grid-cols-2'>
                <Card className='col-span-1'>
                    <CardHeader>
                        <CardTitle>Card Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className='h-[300px]'>
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width='100%' height='100%'>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx='50%'
                                        cy='50%'
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey='value'
                                    >
                                        {pieData.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className='h-full flex items-center justify-center text-muted-foreground'>
                                No cards to display
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className='col-span-1'>
                    <CardHeader>
                        <CardTitle>Review Activity (Last 30 Days)</CardTitle>
                    </CardHeader>
                    <CardContent className='h-[300px]'>
                        {barData.length > 0 ? (
                            <ResponsiveContainer width='100%' height='100%'>
                                <BarChart data={barData}>
                                    <XAxis dataKey='date' fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--background))',
                                            borderColor: 'hsl(var(--border))'
                                        }}
                                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
                                    />
                                    <Bar dataKey='reviews' fill='hsl(var(--primary))' radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className='h-full flex items-center justify-center text-muted-foreground'>
                                No reviews in the last 30 days
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DeckStatistics;
