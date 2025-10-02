import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import {
    ChevronLeft,
    Calendar,
    Clock,
    TrendingUp,
    BarChart3,
    Target,
    Activity,
    Tags,
    Star,
    AlertCircle,
    CheckCircle,
    XCircle,
    Minus,
    Book,
    LineChart
} from 'lucide-react';
import {
    LineChart as RechartsLineChart,
    Line,
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import useGetCardDetails from '@/hooks/queries/use-get-card-details';
import { State, Rating } from '@/types/card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const CardDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    const { data: cardDetails, isLoading, error } = useGetCardDetails(id!);

    const getStateInfo = (state: number) => {
        switch (state) {
            case State.NEW:
                return { text: 'New', color: 'bg-blue-500', icon: Star };
            case State.LEARNING:
                return { text: 'Learning', color: 'bg-yellow-500', icon: TrendingUp };
            case State.REVIEW:
                return { text: 'Review', color: 'bg-green-500', icon: CheckCircle };
            case State.RELEARNING:
                return { text: 'Relearning', color: 'bg-red-500', icon: AlertCircle };
            default:
                return { text: 'Unknown', color: 'bg-gray-500', icon: Minus };
        }
    };

    const getRatingInfo = (rating: number) => {
        switch (rating) {
            case Rating.AGAIN:
                return { text: 'Again', color: 'text-red-500', icon: XCircle };
            case Rating.HARD:
                return { text: 'Hard', color: 'text-orange-500', icon: AlertCircle };
            case Rating.GOOD:
                return { text: 'Good', color: 'text-green-500', icon: CheckCircle };
            case Rating.EASY:
                return { text: 'Easy', color: 'text-blue-500', icon: Star };
            default:
                return { text: 'Unknown', color: 'text-gray-500', icon: Minus };
        }
    };

    const formatDuration = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
        return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    };

    // Prepare data for charts
    const chartData = useMemo(() => {
        if (!cardDetails) return { lineChartData: [], barChartData: [] };

        // Line chart data - showing trends over time
        const lineChartData = cardDetails.revlogs.map((log, index) => ({
            review: index + 1,
            date: format(new Date(log.review), 'MMM dd'),
            fullDate: log.review,
            stability: Math.round(log.stability * 10) / 10,
            interval: log.scheduled_days,
            difficulty: Math.round(log.difficulty * 100) / 100
        }));

        // Bar chart data - rating distribution
        const barChartData = [
            {
                name: 'Again',
                count: cardDetails.metrics.ratingCounts.again,
                fill: '#ef4444'
            },
            {
                name: 'Hard',
                count: cardDetails.metrics.ratingCounts.hard,
                fill: '#f97316'
            },
            {
                name: 'Good',
                count: cardDetails.metrics.ratingCounts.good,
                fill: '#22c55e'
            },
            {
                name: 'Easy',
                count: cardDetails.metrics.ratingCounts.easy,
                fill: '#3b82f6'
            }
        ];

        return { lineChartData, barChartData };
    }, [cardDetails]);

    // Custom tooltip for line chart
    const LineChartTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className='bg-background border border-border rounded-lg p-3 shadow-lg'>
                    <p className='font-medium'>{`Review #${label}`}</p>
                    <p className='text-sm text-muted-foreground mb-2'>{format(new Date(data.fullDate), 'PPP')}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color }} className='text-sm'>
                            {entry.name}: {entry.value}
                            {entry.dataKey === 'interval' ? ' days' : ''}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Custom tooltip for bar chart
    const BarChartTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className='bg-background border border-border rounded-lg p-3 shadow-lg'>
                    <p className='font-medium'>{label}</p>
                    <p style={{ color: payload[0].color }} className='text-sm'>
                        Reviews: {payload[0].value}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (isLoading) {
        return (
            <div className='container max-w-6xl mx-auto py-8 px-4'>
                <div className='flex items-center gap-2 mb-8'>
                    <Skeleton className='h-10 w-10 rounded-full' />
                    <Skeleton className='h-8 w-64' />
                </div>
                <div className='grid gap-6'>
                    <Skeleton className='h-48 w-full' />
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                        <Skeleton className='h-32 w-full' />
                        <Skeleton className='h-32 w-full' />
                        <Skeleton className='h-32 w-full' />
                    </div>
                    <Skeleton className='h-96 w-full' />
                </div>
            </div>
        );
    }

    if (error || !cardDetails) {
        return (
            <div className='max-w-6xl mx-auto py-8 px-4 text-center'>
                <h1 className='text-2xl font-bold mb-4'>Card not found</h1>
                <p className='mb-4'>The card you're looking for doesn't exist or you don't have access to it.</p>
                <Button onClick={() => navigate(-1)}>
                    <ChevronLeft className='mr-2 h-4 w-4' />
                    Go Back
                </Button>
            </div>
        );
    }

    const { card, learningState, retrievability, revlogs, metrics } = cardDetails;
    const stateInfo = getStateInfo(learningState.state);

    return (
        <div className='container max-w-6xl mx-auto py-8 px-4'>
            {/* Header */}
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8'>
                <div className='flex items-center gap-4'>
                    <Button variant='outline' size='icon' onClick={() => navigate(-1)}>
                        <ChevronLeft className='h-5 w-5' />
                    </Button>
                    <div>
                        <h1 className='text-2xl font-bold'>Card Details</h1>
                        <p className='text-muted-foreground'>
                            From deck: <span className='font-medium'>{card.deck.name}</span>
                        </p>
                    </div>
                </div>
                <Badge variant='outline' className={`${stateInfo.color} text-white px-3 py-1`}>
                    <stateInfo.icon className='mr-1 h-4 w-4' />
                    {stateInfo.text}
                </Badge>
            </div>

            {/* Card Content */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <Book className='h-5 w-5' />
                            Front
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='prose prose-sm max-w-none' dangerouslySetInnerHTML={{ __html: card.front }} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <Book className='h-5 w-5' />
                            Back
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='prose prose-sm max-w-none' dangerouslySetInnerHTML={{ __html: card.back }} />
                    </CardContent>
                </Card>
            </div>

            {/* Tags */}
            {card.tags.length > 0 && (
                <Card className='mb-8'>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <Tags className='h-5 w-5' />
                            Tags
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='flex flex-wrap gap-2'>
                            {card.tags.map((tag, index) => (
                                <Badge key={index} variant='secondary'>
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Main Content Tabs */}
            <Tabs defaultValue='overview' value={activeTab} onValueChange={setActiveTab} className='w-full'>
                <TabsList className='mb-6'>
                    <TabsTrigger value='overview'>Overview</TabsTrigger>
                    <TabsTrigger value='history'>Review History</TabsTrigger>
                    <TabsTrigger value='analytics'>Analytics</TabsTrigger>
                    <TabsTrigger value='stats'>Statistics</TabsTrigger>
                </TabsList>

                <TabsContent value='overview' className='space-y-6'>
                    {/* FSRS Stats */}
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                        <Card>
                            <CardHeader className='pb-3'>
                                <CardTitle className='text-lg flex items-center gap-2'>
                                    <Activity className='h-5 w-5' />
                                    Stability
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='text-3xl font-bold text-blue-600'>
                                    {Math.round(learningState.stability * 10) / 10}
                                </div>
                                <p className='text-sm text-muted-foreground'>Days until 90% recall probability</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className='pb-3'>
                                <CardTitle className='text-lg flex items-center gap-2'>
                                    <Target className='h-5 w-5' />
                                    Difficulty
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='text-3xl font-bold text-orange-600'>
                                    {Math.round(learningState.difficulty * 100) / 100}
                                </div>
                                <p className='text-sm text-muted-foreground'>Intrinsic card difficulty (0-10)</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className='pb-3'>
                                <CardTitle className='text-lg flex items-center gap-2'>
                                    <BarChart3 className='h-5 w-5' />
                                    Retrievability
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='text-3xl font-bold text-green-600'>
                                    {retrievability !== null ? `${Math.round(retrievability * 100)}%` : 'N/A'}
                                </div>
                                <p className='text-sm text-muted-foreground'>Current recall probability</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Due Date and Intervals */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>
                                    <Calendar className='h-5 w-5' />
                                    Next Review
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='space-y-2'>
                                    <div className='text-lg font-semibold'>
                                        {format(new Date(learningState.due), 'PPP')}
                                    </div>
                                    <div className='text-sm text-muted-foreground'>
                                        {formatDistanceToNow(new Date(learningState.due), { addSuffix: true })}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>
                                    <Clock className='h-5 w-5' />
                                    Intervals
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='space-y-2'>
                                    <div className='flex justify-between'>
                                        <span className='text-sm'>Days since last review:</span>
                                        <span className='font-medium'>{learningState.elapsed_days}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-sm'>Scheduled interval:</span>
                                        <span className='font-medium'>{learningState.scheduled_days} days</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value='history' className='space-y-6'>
                    <Card>
                        <CardHeader>
                            <CardTitle>Review History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {revlogs.length === 0 ? (
                                <div className='text-center py-8'>
                                    <Activity className='h-12 w-12 mx-auto text-muted-foreground mb-2' />
                                    <h3 className='text-lg font-medium'>No Reviews Yet</h3>
                                    <p className='text-muted-foreground'>This card hasn't been reviewed yet.</p>
                                </div>
                            ) : (
                                <div className='overflow-x-auto'>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Rating</TableHead>
                                                <TableHead>State</TableHead>
                                                <TableHead>Interval</TableHead>
                                                <TableHead>Duration</TableHead>
                                                <TableHead>Stability</TableHead>
                                                <TableHead>Difficulty</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {revlogs.map((log) => {
                                                const ratingInfo = getRatingInfo(log.grade);
                                                const stateInfo = getStateInfo(log.state);

                                                return (
                                                    <TableRow key={log._id}>
                                                        <TableCell>
                                                            <div className='text-sm'>
                                                                {format(new Date(log.review), 'MMM dd, yyyy')}
                                                            </div>
                                                            <div className='text-xs text-muted-foreground'>
                                                                {format(new Date(log.review), 'HH:mm')}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant='outline'
                                                                className={`${ratingInfo.color} border-current`}
                                                            >
                                                                <ratingInfo.icon className='mr-1 h-3 w-3' />
                                                                {ratingInfo.text}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant='outline'
                                                                className={`${stateInfo.color} text-white border-transparent`}
                                                            >
                                                                {stateInfo.text}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className='font-medium'>
                                                            {log.scheduled_days} days
                                                        </TableCell>
                                                        <TableCell>{formatDuration(log.duration)}</TableCell>
                                                        <TableCell>{Math.round(log.stability * 10) / 10}</TableCell>
                                                        <TableCell>{Math.round(log.difficulty * 100) / 100}</TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value='analytics' className='animate-fade-in'>
                    <div className='space-y-6'>
                        {/* Learning Progress Line Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>
                                    <LineChart className='h-5 w-5' />
                                    Learning Progress Over Time
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {chartData.lineChartData.length === 0 ? (
                                    <div className='text-center py-8'>
                                        <TrendingUp className='h-12 w-12 mx-auto text-muted-foreground mb-2' />
                                        <h3 className='text-lg font-medium'>No Review Data</h3>
                                        <p className='text-muted-foreground'>
                                            Charts will appear after you've reviewed this card.
                                        </p>
                                    </div>
                                ) : (
                                    <div className='h-80'>
                                        <ResponsiveContainer width='100%' height='100%'>
                                            <RechartsLineChart data={chartData.lineChartData}>
                                                <CartesianGrid strokeDasharray='3 3' className='opacity-30' />
                                                <XAxis
                                                    dataKey='date'
                                                    tick={{ fontSize: 12 }}
                                                    className='text-muted-foreground'
                                                />
                                                <YAxis tick={{ fontSize: 12 }} className='text-muted-foreground' />
                                                <Tooltip content={<LineChartTooltip />} />
                                                <Legend />
                                                <Line
                                                    type='monotone'
                                                    dataKey='stability'
                                                    stroke='#3b82f6'
                                                    strokeWidth={2}
                                                    name='Stability'
                                                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                                                />
                                                <Line
                                                    type='monotone'
                                                    dataKey='interval'
                                                    stroke='#22c55e'
                                                    strokeWidth={2}
                                                    name='Interval (days)'
                                                    dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                                                    activeDot={{ r: 6, stroke: '#22c55e', strokeWidth: 2 }}
                                                />
                                            </RechartsLineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Rating Distribution Bar Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>
                                    <BarChart3 className='h-5 w-5' />
                                    Rating Distribution
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {cardDetails?.metrics.totalReviews === 0 ? (
                                    <div className='text-center py-8'>
                                        <BarChart3 className='h-12 w-12 mx-auto text-muted-foreground mb-2' />
                                        <h3 className='text-lg font-medium'>No Rating Data</h3>
                                        <p className='text-muted-foreground'>
                                            Rating distribution will appear after you've reviewed this card.
                                        </p>
                                    </div>
                                ) : (
                                    <div className='h-64'>
                                        <ResponsiveContainer width='100%' height='100%'>
                                            <RechartsBarChart data={chartData.barChartData}>
                                                <CartesianGrid strokeDasharray='3 3' className='opacity-30' />
                                                <XAxis
                                                    dataKey='name'
                                                    tick={{ fontSize: 12 }}
                                                    className='text-muted-foreground'
                                                />
                                                <YAxis tick={{ fontSize: 12 }} className='text-muted-foreground' />
                                                <Tooltip content={<BarChartTooltip />} />
                                                <Bar dataKey='count' radius={[4, 4, 0, 0]} className='cursor-pointer' />
                                            </RechartsBarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Difficulty Progression */}
                        {chartData.lineChartData.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className='flex items-center gap-2'>
                                        <Target className='h-5 w-5' />
                                        Difficulty Progression
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className='h-64'>
                                        <ResponsiveContainer width='100%' height='100%'>
                                            <RechartsLineChart data={chartData.lineChartData}>
                                                <CartesianGrid strokeDasharray='3 3' className='opacity-30' />
                                                <XAxis
                                                    dataKey='date'
                                                    tick={{ fontSize: 12 }}
                                                    className='text-muted-foreground'
                                                />
                                                <YAxis tick={{ fontSize: 12 }} className='text-muted-foreground' />
                                                <Tooltip content={<LineChartTooltip />} />
                                                <Legend />
                                                <Line
                                                    type='monotone'
                                                    dataKey='difficulty'
                                                    stroke='#f97316'
                                                    strokeWidth={3}
                                                    name='Difficulty'
                                                    dot={{ fill: '#f97316', strokeWidth: 2, r: 5 }}
                                                    activeDot={{ r: 7, stroke: '#f97316', strokeWidth: 2 }}
                                                />
                                            </RechartsLineChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className='mt-4 p-4 bg-muted/30 rounded-lg'>
                                        <p className='text-sm text-muted-foreground'>
                                            <strong>Difficulty</strong> represents how hard this card is to remember.
                                            Lower values indicate the card is easier to recall, while higher values
                                            suggest more challenging content.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value='stats' className='space-y-6'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Metrics</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <div className='flex justify-between items-center'>
                                    <span>Total Reviews:</span>
                                    <span className='font-bold text-xl'>{metrics.totalReviews}</span>
                                </div>
                                <div className='flex justify-between items-center'>
                                    <span>Average Rating:</span>
                                    <span className='font-bold text-xl'>{metrics.averageRating}</span>
                                </div>
                                <div className='space-y-2'>
                                    <div className='flex justify-between items-center'>
                                        <span>Success Rate:</span>
                                        <span className='font-bold text-xl text-green-600'>
                                            {Math.round(metrics.successRate * 100)}%
                                        </span>
                                    </div>
                                    <Progress value={metrics.successRate * 100} className='h-2' />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Rating Distribution</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                <div className='flex justify-between items-center'>
                                    <span className='flex items-center gap-2'>
                                        <XCircle className='h-4 w-4 text-red-500' />
                                        Again
                                    </span>
                                    <span className='font-medium'>{metrics.ratingCounts.again}</span>
                                </div>
                                <div className='flex justify-between items-center'>
                                    <span className='flex items-center gap-2'>
                                        <AlertCircle className='h-4 w-4 text-orange-500' />
                                        Hard
                                    </span>
                                    <span className='font-medium'>{metrics.ratingCounts.hard}</span>
                                </div>
                                <div className='flex justify-between items-center'>
                                    <span className='flex items-center gap-2'>
                                        <CheckCircle className='h-4 w-4 text-green-500' />
                                        Good
                                    </span>
                                    <span className='font-medium'>{metrics.ratingCounts.good}</span>
                                </div>
                                <div className='flex justify-between items-center'>
                                    <span className='flex items-center gap-2'>
                                        <Star className='h-4 w-4 text-blue-500' />
                                        Easy
                                    </span>
                                    <span className='font-medium'>{metrics.ratingCounts.easy}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Card Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Card Information</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3'>
                            <div className='flex justify-between items-center'>
                                <span>Created:</span>
                                <span>{format(new Date(card.createdAt), 'PPP')}</span>
                            </div>
                            <div className='flex justify-between items-center'>
                                <span>Last Updated:</span>
                                <span>{format(new Date(card.updatedAt), 'PPP')}</span>
                            </div>
                            <div className='flex justify-between items-center'>
                                <span>Deck:</span>
                                <span className='font-medium'>{card.deck.name}</span>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default CardDetails;
