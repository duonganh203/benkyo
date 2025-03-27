import { Link, useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from '@/components/ui/pagination';
import useGetAllAttempts from '@/hooks/queries/use-get-all-quiz-attempt';
import { ChevronLeft, NotebookPen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const Quizzes = () => {
    const { data: quizAttempts, isLoading } = useGetAllAttempts();
    const navigate = useNavigate();

    const calculateTimeTaken = (startTime: string, endTime: string) => {
        if (!startTime || !endTime) return 'N/A';

        const start = new Date(startTime).getTime();
        const end = new Date(endTime).getTime();

        const durationMs = end - start;
        if (durationMs <= 0) return 'Invalid Time';

        const minutes = Math.floor(durationMs / 60000);
        const seconds = Math.floor((durationMs % 60000) / 1000);

        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(seconds).padStart(2, '0');

        return `${formattedMinutes}:${formattedSeconds}`;
    };

    // Skeleton loading state
    if (isLoading) {
        return (
            <div className='min-h-screen w-full'>
                <div className='max-w-4xl mx-auto px-4 py-12 sm:px-6 sm:py-16'>
                    <div className='space-y-4 mb-8'>
                        <Skeleton className='h-8 w-64' />
                        <Skeleton className='h-4 w-80' />
                    </div>

                    <div className='space-y-6'>
                        <div className='rounded-lg border shadow-sm overflow-hidden'>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className='w-[300px]'>
                                            <Skeleton className='h-4 w-24' />
                                        </TableHead>
                                        <TableHead>
                                            <Skeleton className='h-4 w-24' />
                                        </TableHead>
                                        <TableHead>
                                            <Skeleton className='h-4 w-24' />
                                        </TableHead>
                                        <TableHead className='text-right'>
                                            <Skeleton className='h-4 w-24' />
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[...Array(5)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell>
                                                <Skeleton className='h-4 w-48' />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className='h-4 w-8' />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className='h-4 w-8' />
                                            </TableCell>
                                            <TableCell className='text-right'>
                                                <Skeleton className='h-4 w-16 ml-auto' />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className='flex justify-center'>
                            <Skeleton className='h-10 w-64' />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen w-full'>
            <div className='max-w-4xl mx-auto px-4 py-12 sm:px-6 sm:py-16'>
                <div className=''>
                    <h1 className='text-3xl font-semibold tracking-tight'>Quiz Results</h1>
                    <p className='mt-1 text-muted-foreground'>View and analyze your past quiz performances</p>
                </div>

                {quizAttempts && quizAttempts.length > 0 ? (
                    <div className='space-y-6'>
                        <div className='rounded-lg border shadow-sm overflow-hidden'>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className='w-[300px]'>Quiz Name</TableHead>
                                        <TableHead>Correct Answers</TableHead>
                                        <TableHead>Incorrect Answers</TableHead>
                                        <TableHead className='text-right'>Time Taken</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {quizAttempts.map((result) => {
                                        const incorrectCount = result.totalQuestions - result.correctAnswers;
                                        return (
                                            <TableRow
                                                key={result._id}
                                                className='hover:bg-muted/50 cursor-pointer'
                                                onClick={() => navigate(`/quiz/attempt/${result._id}`)}
                                            >
                                                <TableCell className='font-medium'>{result.quiz.deck.name}</TableCell>
                                                <TableCell className='text-green-600'>
                                                    {result.correctAnswers}
                                                </TableCell>
                                                <TableCell className='text-red-600'>{incorrectCount}</TableCell>
                                                <TableCell className='text-right'>
                                                    {calculateTimeTaken(result.startTime, result.endTime)}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>

                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious href='#' />
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationLink href='#' isActive>
                                        1
                                    </PaginationLink>
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationNext href='#' />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                ) : (
                    <div className='text-center py-16'>
                        <div className='mb-4 flex justify-center'>
                            <NotebookPen className='h-16 w-16 text-primary/60' />
                        </div>
                        <h2 className='text-2xl font-semibold mb-2 text-foreground'>No Quiz's Results found</h2>
                        <Button asChild className='items-center'>
                            <Link to='/my-decks'>
                                <ChevronLeft className='h-4 w-4' />
                                Do Quiz Now!
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Quizzes;
