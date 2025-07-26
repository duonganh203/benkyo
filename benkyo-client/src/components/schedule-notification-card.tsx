import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Clock, BookOpen, Target, Activity as ProgressIcon } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { OverdueSchedule, UpcomingDeadline } from '@/types/class';

interface ScheduleNotificationCardProps {
    notification: OverdueSchedule | UpcomingDeadline;
    onDismiss?: (id: string) => void;
}

export const ScheduleNotificationCard = ({ notification }: ScheduleNotificationCardProps) => {
    const isOverdue = 'hoursOverdue' in notification;

    const timeDisplay = isOverdue
        ? `${Math.floor(notification.hoursOverdue / 24)}d ${notification.hoursOverdue % 24}h overdue`
        : `${Math.floor(notification.hoursUntilDeadline / 24)}d ${notification.hoursUntilDeadline % 24}h left`;

    const endTimeAgo = formatDistanceToNow(new Date(notification.endTime), {
        addSuffix: true
    });

    return (
        <Card
            className={`overflow-hidden hover:shadow-md transition-shadow ${
                isOverdue ? 'border-red-300' : 'border-yellow-300'
            }`}
        >
            <CardContent className='p-6'>
                <div className='flex items-start gap-3'>
                    <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${
                            isOverdue ? 'border-red-200 text-red-600' : 'border-yellow-200 text-yellow-600'
                        }`}
                    >
                        {isOverdue ? <AlertTriangle className='w-4 h-4' /> : <Clock className='w-4 h-4' />}
                    </div>
                    <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-2'>
                            <h3 className='font-bold text-lg text-foreground'>{notification.deckName}</h3>
                            <Badge variant={isOverdue ? 'destructive' : 'outline'} className='text-xs'>
                                {isOverdue ? 'Overdue' : 'Due Soon'}
                            </Badge>
                        </div>

                        <div className='flex items-center gap-1 text-sm text-muted-foreground mb-3'>
                            <BookOpen className='w-3 h-3' />
                            <span>Class: {notification.className}</span>
                        </div>

                        {notification.description && (
                            <p className='text-sm text-muted-foreground mb-3'>{notification.description}</p>
                        )}

                        <div className='space-y-2'>
                            <div className='flex items-center justify-between text-sm'>
                                <div className='flex items-center gap-1'>
                                    <ProgressIcon className='w-3 h-3' />
                                    <span>Progress: {notification.progress}%</span>
                                </div>
                                <div className='flex items-center gap-1'>
                                    <Target className='w-3 h-3' />
                                    <span>
                                        {notification.completedCards}/{notification.totalCards} cards
                                    </span>
                                </div>
                            </div>
                            <Progress value={notification.progress} className='h-2' />
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className='py-3 px-6 border-t flex justify-between items-center'>
                <div className='flex items-center text-xs text-muted-foreground'>
                    <Clock className='h-3 w-3 mr-1' />
                    <span>
                        {timeDisplay} • Deadline {endTimeAgo}
                    </span>
                </div>
                <div className='flex gap-2'>
                    <Badge
                        variant='outline'
                        className={`text-xs ${
                            isOverdue ? 'border-red-300 text-red-700' : 'border-yellow-300 text-yellow-700'
                        }`}
                    >
                        {timeDisplay}
                    </Badge>
                </div>
            </CardFooter>
        </Card>
    );
};
