import { Bell, Loader2, Users, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import useAcceptInviteClass from '@/hooks/queries/use-accept-invite-class';
import useRejectInviteClass from '@/hooks/queries/use-reject-invite-class';
import useGetAllNotifications from '@/hooks/queries/use-get-all-notifications';
import { NotificationCard } from '@/components/notification-card';
import { ScheduleNotificationCard } from '@/components/schedule-notification-card';
import { getToast } from '@/utils/getToast';
import { useNotificationStore } from '@/hooks/stores/use-notification-store';
import { UnifiedNotification } from '@/types/class';
import { Button } from '@/components/ui/button';

const Notifications = () => {
    const { data: notificationsData, isLoading, error, refetch } = useGetAllNotifications();

    const { setNotifications } = useNotificationStore();
    const { mutateAsync: acceptInvite } = useAcceptInviteClass();
    const { mutateAsync: rejectInvite } = useRejectInviteClass();

    const allNotifications = notificationsData?.all || [];
    const displayedNotifications = notificationsData?.invites || [];
    const overdueSchedules = notificationsData?.schedules?.overdue || [];
    const upcomingDeadlines = notificationsData?.schedules?.upcoming || [];
    const criticalUpcoming = notificationsData?.schedules?.criticalUpcoming || [];

    const totalInvites = notificationsData?.summary?.totalInvites || 0;
    const totalSchedule =
        (notificationsData?.summary?.totalOverdue || 0) + (notificationsData?.schedules?.upcoming?.length || 0);
    const totalNotifications = notificationsData?.summary?.totalAll || 0;

    const handleAccept = async (classId: string) => {
        try {
            await acceptInvite({ classId });
            await refetch();
            setNotifications(displayedNotifications);
            getToast('success', 'Successfully joined the class.');
        } catch {
            getToast('error', 'Failed to join the class.');
        }
    };

    const handleReject = async (classId: string) => {
        try {
            await rejectInvite({ classId });
            await refetch();
            setNotifications(displayedNotifications);
            getToast('success', 'Invitation rejected.');
        } catch {
            getToast('error', 'Failed to reject the invitation.');
        }
    };

    const renderNotification = (notification: UnifiedNotification) => {
        if (notification.notificationType === 'invite') {
            return (
                <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onAcceptInvite={handleAccept}
                    onRejectInvite={handleReject}
                />
            );
        } else if (notification.notificationType === 'overdue' || notification.notificationType === 'upcoming') {
            return (
                <ScheduleNotificationCard
                    key={`${notification.notificationType}-${notification.classId}-${notification.deckId}`}
                    notification={notification}
                />
            );
        }
        return null;
    };

    if (error) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <Card className='w-full max-w-md'>
                    <CardContent className='pt-6 text-center'>
                        <p className='text-destructive mb-4'>Failed to load notifications</p>
                        <Button
                            onClick={() => window.location.reload()}
                            className='px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90'
                        >
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-background'>
            <div className='max-w-4xl mx-auto p-6'>
                <div className='mb-8'>
                    <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center'>
                            <Bell className='w-5 h-5 text-primary' />
                        </div>
                        <div>
                            <h1 className='text-2xl font-bold text-foreground'>Notifications</h1>
                            <p className='text-muted-foreground'>Manage your invitations and schedule alerts</p>
                        </div>
                        {totalNotifications > 0 && (
                            <Badge variant='destructive' className='ml-auto'>
                                {totalNotifications}
                            </Badge>
                        )}
                    </div>
                    <div className='flex items-center gap-4 mt-4'>
                        <span className='text-sm text-muted-foreground'>Total: {totalNotifications} notifications</span>
                    </div>
                </div>

                {isLoading ? (
                    <div className='flex items-center justify-center py-12'>
                        <div className='text-center'>
                            <Loader2 className='w-8 h-8 animate-spin mx-auto mb-4 text-primary' />
                            <p className='text-muted-foreground'>Loading notifications...</p>
                        </div>
                    </div>
                ) : (
                    <Tabs defaultValue='all' className='w-full'>
                        <TabsList className='grid w-full grid-cols-3'>
                            <TabsTrigger value='all' className='relative'>
                                All
                                {totalNotifications > 0 && (
                                    <Badge variant='secondary' className='ml-1 text-xs'>
                                        {totalNotifications}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value='invites' className='relative'>
                                <Users className='w-4 h-4 mr-1' />
                                Class Invites
                                {totalInvites > 0 && (
                                    <Badge variant='secondary' className='ml-1 text-xs'>
                                        {totalInvites}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value='schedule' className='relative'>
                                <Clock className='w-4 h-4 mr-1' />
                                Schedule Alerts
                                {totalSchedule > 0 && (
                                    <Badge variant='destructive' className='ml-1 text-xs'>
                                        {totalSchedule}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value='all' className='space-y-4 mt-6'>
                            {totalNotifications === 0 ? (
                                <Card>
                                    <CardContent className='pt-6'>
                                        <div className='text-center py-12'>
                                            <Bell className='w-16 h-16 mx-auto mb-4 text-muted-foreground' />
                                            <h3 className='text-lg font-medium mb-2 text-foreground'>
                                                No notifications
                                            </h3>
                                            <p className='text-muted-foreground'>You have no notifications</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className='space-y-4'>
                                    {allNotifications.map((notification) => renderNotification(notification))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value='invites' className='space-y-4 mt-6'>
                            {totalInvites === 0 ? (
                                <Card>
                                    <CardContent className='pt-6'>
                                        <div className='text-center py-12'>
                                            <Users className='w-16 h-16 mx-auto mb-4 text-muted-foreground' />
                                            <h3 className='text-lg font-medium mb-2 text-foreground'>
                                                No class invitations
                                            </h3>
                                            <p className='text-muted-foreground'>
                                                You have no pending class invitations
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className='space-y-4'>
                                    {allNotifications
                                        .filter((notification) => notification.notificationType === 'invite')
                                        .map((notification) => renderNotification(notification))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value='schedule' className='space-y-4 mt-6'>
                            {totalSchedule === 0 ? (
                                <Card>
                                    <CardContent className='pt-6'>
                                        <div className='text-center py-12'>
                                            <Clock className='w-16 h-16 mx-auto mb-4 text-muted-foreground' />
                                            <h3 className='text-lg font-medium mb-2 text-foreground'>
                                                No schedule alerts
                                            </h3>
                                            <p className='text-muted-foreground'>
                                                All your scheduled study sessions are up to date!
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className='space-y-4'>
                                    {overdueSchedules.length > 0 && (
                                        <div className='space-y-4'>
                                            <div className='flex items-center gap-2 text-red-600'>
                                                <AlertTriangle className='w-4 h-4' />
                                                <h3 className='font-medium'>Overdue ({overdueSchedules.length})</h3>
                                            </div>
                                            {overdueSchedules.map((schedule) => (
                                                <ScheduleNotificationCard
                                                    key={`overdue-${schedule.classId}-${schedule.deckId}`}
                                                    notification={schedule}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {criticalUpcoming.length > 0 && (
                                        <div className='space-y-4'>
                                            <div className='flex items-center gap-2 text-yellow-600'>
                                                <Clock className='w-4 h-4' />
                                                <h3 className='font-medium'>Due Soon ({criticalUpcoming.length})</h3>
                                            </div>
                                            {criticalUpcoming.map((deadline) => (
                                                <ScheduleNotificationCard
                                                    key={`upcoming-${deadline.classId}-${deadline.deckId}`}
                                                    notification={deadline}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {upcomingDeadlines.length > 0 && (
                                        <div className='space-y-4'>
                                            <div className='flex items-center gap-2 text-blue-600'>
                                                <Calendar className='w-4 h-4' />
                                                <h3 className='font-medium'>This Week ({upcomingDeadlines.length})</h3>
                                            </div>
                                            {upcomingDeadlines.map((deadline) => (
                                                <ScheduleNotificationCard
                                                    key={`all-upcoming-${deadline.classId}-${deadline.deckId}`}
                                                    notification={deadline}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </div>
    );
};

export default Notifications;
