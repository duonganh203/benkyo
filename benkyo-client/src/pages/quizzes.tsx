import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { mockQuizResults } from '@/utils/mockData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from '@/components/ui/pagination';

const Quizzes = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Simulate loading data
        const timer = setTimeout(() => {
            setIsLoaded(true);
        }, 200);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className='min-h-screen w-full bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950'>
            <div className='max-w-4xl mx-auto px-4 py-12 sm:px-6 sm:py-16'>
                <div className='flex items-center mb-8'>
                    <div className=''>
                        <h1 className='text-3xl font-semibold tracking-tight'>Quiz Results</h1>
                        <p className='mt-1 text-muted-foreground'>View and analyze your past quiz performances</p>
                    </div>
                </div>

                {isLoaded ? (
                    <div className='space-y-6'>
                        {mockQuizResults.length > 0 ? (
                            <>
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
                                            {mockQuizResults.map((result) => {
                                                const incorrectCount = result.totalQuestions - result.score;

                                                return (
                                                    <TableRow
                                                        key={result.id}
                                                        className='hover:bg-muted/50 cursor-pointer'
                                                        onClick={() => {
                                                            // Future implementation: Navigate to detailed view
                                                            console.log(`View details for quiz: ${result.id}`);
                                                        }}
                                                    >
                                                        <TableCell className='font-medium'>{result.title}</TableCell>
                                                        <TableCell className='text-green-600'>{result.score}</TableCell>
                                                        <TableCell className='text-red-600'>{incorrectCount}</TableCell>
                                                        <TableCell className='text-right'>{result.timeTaken}</TableCell>
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
                            </>
                        ) : (
                            <div className='text-center py-12'>
                                <p className='text-lg text-muted-foreground'>You haven't taken any quizzes yet.</p>
                                <Link
                                    to='/'
                                    className='inline-block mt-4 py-2 px-4 rounded bg-primary text-white hover:bg-primary/90 transition-colors'
                                >
                                    Start a Quiz
                                </Link>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className='space-y-4'>
                        {[1, 2, 3].map((n) => (
                            <div key={n} className='h-16 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse' />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Quizzes;
