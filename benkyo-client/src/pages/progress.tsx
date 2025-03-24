import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { PieChart } from '@/components/progress-charts';
import { Activity, BookOpen } from 'lucide-react';
import useGetUserProgress from '@/hooks/queries/use-get-user-progress';

const ProgressPage = () => {
    const { data: progressStats, isPending } = useGetUserProgress();

    const pieData = [
        { name: 'Mastered', value: progressStats?.masteredFlashcards ?? 0, color: '#16a34a' },
        { name: 'Studying', value: progressStats?.studyingFlashcards ?? 0, color: '#0ea5e9' },
        { name: 'New', value: progressStats?.newFlashcards ?? 0, color: '#6b7280' }
    ];
    if (isPending) return <div>Loading...</div>;
    return (
        <div className='min-h-screen flex flex-col mx-auto max-w-[1200px]'>
            <main className='container flex-1 py-8 px-4 md:px-6'>
                <div className='mb-8 flex flex-col items-center space-y-2 text-center'>
                    <h1 className='text-3xl md:text-4xl font-medium tracking-tight animate-fade-in'>
                        Your Learning Progress
                    </h1>
                    <p className='text-muted-foreground max-w-[700px] animate-fade-in'>
                        Track your flashcard study progress and see your improvement over time
                    </p>
                </div>

                <div className='grid gap-6 md:grid-cols-2 mb-8'>
                    <Card className='animate-scale-in'>
                        <CardHeader className='flex flex-row items-center justify-between pb-2'>
                            <CardTitle className='text-lg font-medium'>Flashcards Studied</CardTitle>
                            <BookOpen className='h-4 w-4 text-muted-foreground' />
                        </CardHeader>
                        <CardContent>
                            <div className='text-3xl font-bold'>{progressStats?.totalFlashcards}</div>

                            <p className='text-xs text-muted-foreground'>Across All Decks</p>
                            <div className='mt-4'>
                                <div className='flex items-center justify-between mb-1'>
                                    <span className='text-sm'>Mastery Progress</span>
                                    <span className='text-sm font-medium'>
                                        {progressStats?.completionRate !== undefined
                                            ? Math.round(progressStats.completionRate)
                                            : 0}
                                        %
                                    </span>
                                </div>
                                <Progress value={progressStats?.completionRate ?? 0} className='h-2' />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className='animate-scale-in animation-delay-100'>
                        <CardHeader className='flex flex-row items-center justify-between pb-2'>
                            <CardTitle className='text-lg font-medium'>Card Status</CardTitle>
                            <Activity className='h-4 w-4 text-muted-foreground' />
                        </CardHeader>
                        <CardContent>
                            <div className='h-[180px] flex items-center justify-center'>
                                <PieChart data={pieData} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className='mb-8'>
                    <h2 className='text-xl font-medium mb-4'>Recommended for Review</h2>
                    {progressStats?.recommendedDecks && progressStats.recommendedDecks.length > 0 ? (
                        <div className='grid gap-4 md:grid-cols-2'>
                            {progressStats.recommendedDecks.map((deck, index) => (
                                <Card
                                    key={deck.deck._id}
                                    className='animate-scale-in'
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <CardHeader className='pb-2'>
                                        <CardTitle className='text-lg'>{deck.deck.name}</CardTitle>
                                        <CardDescription>{deck.deck.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className='pt-0 flex justify-end gap-2'>
                                        <Button variant='outline' asChild>
                                            <Link to={`/deck/${deck.deck._id}`}>Study</Link>
                                        </Button>
                                        <Button asChild>
                                            <Link to={`/home`}>Quiz</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className='animate-fade-in'>
                            <CardContent className='py-6'>
                                <p className='text-center text-muted-foreground'>
                                    No recommended decks at the moment.
                                    <br />
                                    Create more flashcards to get personalized recommendations.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ProgressPage;
