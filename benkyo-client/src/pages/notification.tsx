import { Bell, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import useAcceptInviteClass from '@/hooks/queries/use-accept-invite-class';
import useGetInviteClass from '@/hooks/queries/use-get-invite-class';
import useRejectInviteClass from '@/hooks/queries/use-reject-invite-class';
import { NotificationCard } from '@/components/notification-card';
import { getToast } from '@/utils/getToast';
import { useNotificationStore } from '@/hooks/stores/use-notification-store';

const Notifications = () => {
    const { data: notificationList, isLoading, error, refetch } = useGetInviteClass();
    const { setNotifications } = useNotificationStore();
    const { mutateAsync: acceptInvite } = useAcceptInviteClass();
    const { mutateAsync: rejectInvite } = useRejectInviteClass();

    const displayedNotifications = notificationList ?? [];

    const handleAccept = async (classId: string) => {
        try {
            await acceptInvite({ classId });
            const { data: updatedList } = await refetch();
            setNotifications(updatedList ?? []);
            getToast('success', 'Successfully joined the class.');
        } catch {
            getToast('error', 'Failed to join the class.');
        }
    };

    const handleReject = async (classId: string) => {
        try {
            await rejectInvite({ classId });
            const { data: updatedList } = await refetch();
            setNotifications(updatedList ?? []);
            getToast('success', 'Invitation rejected.');
        } catch {
            getToast('error', 'Failed to reject the invitation.');
        }
    };

    if (error) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <Card className='w-full max-w-md'>
                    <CardContent className='pt-6 text-center'>
                        <p className='text-destructive mb-4'>Failed to load notifications</p>
                        <button
                            onClick={() => window.location.reload()}
                            className='px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90'
                        >
                            Retry
                        </button>
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
                            <p className='text-muted-foreground'>Manage your class invitations</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-4 mt-4'>
                        <span className='text-sm text-muted-foreground'>
                            Total: {displayedNotifications.length} notifications
                        </span>
                    </div>
                </div>

                {isLoading ? (
                    <div className='flex items-center justify-center py-12'>
                        <div className='text-center'>
                            <Loader2 className='w-8 h-8 animate-spin mx-auto mb-4 text-primary' />
                            <p className='text-muted-foreground'>Loading notifications...</p>
                        </div>
                    </div>
                ) : displayedNotifications.length === 0 ? (
                    <Card>
                        <CardContent className='pt-6'>
                            <div className='text-center py-12'>
                                <Bell className='w-16 h-16 mx-auto mb-4 text-muted-foreground' />
                                <h3 className='text-lg font-medium mb-2 text-foreground'>No notifications</h3>
                                <p className='text-muted-foreground'>You have no notifications</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className='space-y-4'>
                        {displayedNotifications.map((item) => (
                            <NotificationCard
                                key={item.id}
                                notification={item}
                                onAcceptInvite={handleAccept}
                                onRejectInvite={handleReject}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
