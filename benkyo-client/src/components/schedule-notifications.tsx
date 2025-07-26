import { useState } from 'react';
import { Bell, Clock, AlertTriangle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import useGetOverdueSchedules from '@/hooks/queries/use-get-overdue-schedules';
import useGetUpcomingDeadlines from '@/hooks/queries/use-get-upcoming-deadlines';
import { OverdueSchedule, UpcomingDeadline } from '@/types/class';

const ScheduleNotifications = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [dismissed, setDismissed] = useState<string[]>([]);

    const { data: overdueData } = useGetOverdueSchedules();
    const { data: upcomingData } = useGetUpcomingDeadlines();

    const overdueSchedules = overdueData?.data || [];
    const upcomingDeadlines = upcomingData?.data || [];

    const activeOverdue = overdueSchedules.filter(
        (schedule) => !dismissed.includes(`overdue-${schedule.classId}-${schedule.deckId}`)
    );
    const activeUpcoming = upcomingDeadlines.filter(
        (deadline) =>
            !dismissed.includes(`upcoming-${deadline.classId}-${deadline.deckId}`) && deadline.hoursUntilDeadline <= 48
    );

    const totalNotifications = activeOverdue.length + activeUpcoming.length;

    const handleDismiss = (id: string) => {
        setDismissed((prev) => [...prev, id]);
    };

    const formatTimeLeft = (hours: number) => {
        if (hours < 24) {
            return `${hours}h left`;
        }
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        return `${days}d ${remainingHours}h left`;
    };

    const formatOverdue = (hours: number) => {
        if (hours < 24) {
            return `${hours}h overdue`;
        }
        const days = Math.floor(hours / 24);
        return `${days}d overdue`;
    };

    if (totalNotifications === 0) {
        return null;
    }

    return (
        <div className='fixed top-4 right-4 z-50 w-96'>
            <Card className='border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 shadow-lg'>
                <CardHeader className='cursor-pointer' onClick={() => setIsExpanded(!isExpanded)}>
                    <CardTitle className='flex items-center justify-between text-orange-800'>
                        <div className='flex items-center gap-2'>
                            <Bell className='w-5 h-5' />
                            <span>Schedule Notifications</span>
                            <Badge variant='destructive' className='ml-2'>
                                {totalNotifications}
                            </Badge>
                        </div>
                        {isExpanded ? <ChevronUp className='w-4 h-4' /> : <ChevronDown className='w-4 h-4' />}
                    </CardTitle>
                </CardHeader>

                {isExpanded && (
                    <CardContent className='space-y-3 max-h-96 overflow-y-auto'>
                        {activeOverdue.map((schedule: OverdueSchedule) => (
                            <div
                                key={`overdue-${schedule.classId}-${schedule.deckId}`}
                                className='p-3 bg-red-50 border border-red-200 rounded-md'
                            >
                                <div className='flex items-start justify-between'>
                                    <div className='flex-1'>
                                        <div className='flex items-center gap-2 mb-1'>
                                            <AlertTriangle className='w-4 h-4 text-red-600' />
                                            <span className='font-medium text-red-800'>Overdue!</span>
                                            <Badge variant='destructive' className='text-xs'>
                                                {formatOverdue(schedule.hoursOverdue)}
                                            </Badge>
                                        </div>
                                        <h4 className='font-semibold text-sm text-gray-800'>{schedule.deckName}</h4>
                                        <p className='text-xs text-gray-600 mb-2'>Class: {schedule.className}</p>
                                        <div className='space-y-1'>
                                            <div className='flex justify-between text-xs'>
                                                <span>Progress: {schedule.progress}%</span>
                                                <span>
                                                    {schedule.completedCards}/{schedule.totalCards} cards
                                                </span>
                                            </div>
                                            <Progress value={schedule.progress} className='h-2' />
                                        </div>
                                    </div>
                                    <Button
                                        variant='ghost'
                                        size='sm'
                                        className='ml-2 h-6 w-6 p-0'
                                        onClick={() => handleDismiss(`overdue-${schedule.classId}-${schedule.deckId}`)}
                                    >
                                        <X className='w-3 h-3' />
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {activeUpcoming.map((deadline: UpcomingDeadline) => (
                            <div
                                key={`upcoming-${deadline.classId}-${deadline.deckId}`}
                                className='p-3 bg-yellow-50 border border-yellow-200 rounded-md'
                            >
                                <div className='flex items-start justify-between'>
                                    <div className='flex-1'>
                                        <div className='flex items-center gap-2 mb-1'>
                                            <Clock className='w-4 h-4 text-yellow-600' />
                                            <span className='font-medium text-yellow-800'>Due Soon</span>
                                            <Badge variant='outline' className='text-xs border-yellow-300'>
                                                {formatTimeLeft(deadline.hoursUntilDeadline)}
                                            </Badge>
                                        </div>
                                        <h4 className='font-semibold text-sm text-gray-800'>{deadline.deckName}</h4>
                                        <p className='text-xs text-gray-600 mb-2'>Class: {deadline.className}</p>
                                        <div className='space-y-1'>
                                            <div className='flex justify-between text-xs'>
                                                <span>Progress: {deadline.progress}%</span>
                                                <span>
                                                    {deadline.completedCards}/{deadline.totalCards} cards
                                                </span>
                                            </div>
                                            <Progress value={deadline.progress} className='h-2' />
                                        </div>
                                    </div>
                                    <Button
                                        variant='ghost'
                                        size='sm'
                                        className='ml-2 h-6 w-6 p-0'
                                        onClick={() => handleDismiss(`upcoming-${deadline.classId}-${deadline.deckId}`)}
                                    >
                                        <X className='w-3 h-3' />
                                    </Button>
                                </div>
                            </div>
                        ))}

                        <div className='pt-2 border-t border-orange-200'>
                            <p className='text-xs text-orange-700 text-center'>
                                Complete your scheduled study sessions to stay on track!
                            </p>
                        </div>
                    </CardContent>
                )}
            </Card>
        </div>
    );
};

export default ScheduleNotifications;
