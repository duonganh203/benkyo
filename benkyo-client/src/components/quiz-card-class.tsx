import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Edit, Trash2, Zap, BookOpen, Calendar } from 'lucide-react';
import { Quiz } from '@/pages/class-quiz-management';

interface QuizCardProps {
    quiz: Quiz;
    onDelete: (quizId: string) => void;
}

export const QuizCardClass = ({ quiz, onDelete }: QuizCardProps) => {
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date);
    };

    return (
        <Card className='group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border bg-card'>
            <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                        <CardTitle className='text-lg font-bold text-foreground group-hover:text-primary transition-colors'>
                            {quiz.title}
                        </CardTitle>
                        <CardDescription className='mt-1 line-clamp-2 text-muted-foreground'>
                            {quiz.description}
                        </CardDescription>
                    </div>
                    <Badge
                        variant={quiz.type === 'ai' ? 'secondary' : 'outline'}
                        className={
                            quiz.type === 'ai'
                                ? 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                                : 'border-primary text-primary hover:bg-primary/10'
                        }
                    >
                        {quiz.type === 'ai' ? (
                            <>
                                <Zap className='w-3 h-3 mr-1' />
                                AI Generated
                            </>
                        ) : (
                            <>
                                <BookOpen className='w-3 h-3 mr-1' />
                                Manual
                            </>
                        )}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className='pt-0'>
                <div className='space-y-4'>
                    {/* Quiz Stats */}
                    <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                        <div className='flex items-center gap-1'>
                            <BookOpen className='w-4 h-4' />
                            <span>{quiz.questions.length} questions</span>
                        </div>
                        <div className='flex items-center gap-1'>
                            <Calendar className='w-4 h-4' />
                            <span>{formatDate(quiz.createdAt)}</span>
                        </div>
                    </div>

                    {/* Deck info for AI quizzes */}
                    {quiz.type === 'ai' && quiz.deck && (
                        <div className='flex items-center gap-2 p-2 bg-muted/50 rounded-md'>
                            <Zap className='w-4 h-4 text-primary' />
                            <span className='text-sm font-medium text-foreground'>From: {quiz.deck}</span>
                        </div>
                    )}

                    {/* Sample question preview */}
                    {quiz.questions.length > 0 && (
                        <div className='p-3 bg-muted/30 rounded-md border-l-4 border-primary'>
                            <p className='text-sm font-medium text-foreground mb-1'>Sample Question:</p>
                            <p className='text-sm text-muted-foreground line-clamp-2'>{quiz.questions[0].question}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className='flex gap-2 pt-2'>
                        <Button size='sm' className='flex-1 bg-primary hover:bg-primary/90 text-primary-foreground'>
                            <Play className='w-4 h-4 mr-2' />
                            Start Quiz
                        </Button>
                        <Button size='sm' variant='outline' className='text-foreground hover:bg-muted'>
                            <Edit className='w-4 h-4' />
                        </Button>
                        <Button size='sm' variant='destructive' className='hover:bg-destructive/90'>
                            <Trash2 className='w-4 h-4' />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
