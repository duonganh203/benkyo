import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Bell, Users, Check, X, Clock } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClassNotification } from '@/types/notification';

interface NotificationCardProps {
    notification: ClassNotification;
    onAcceptInvite?: (notificationId: string, classId: string) => void;
    onRejectInvite?: (notificationId: string, classId: string) => void;
}

export const NotificationCard = ({ notification, onAcceptInvite, onRejectInvite }: NotificationCardProps) => {
    const timeAgo = formatDistanceToNow(notification.createdAt, {
        addSuffix: true,
        locale: vi
    });

    const handleAccept = () => {
        if (notification.classId && onAcceptInvite) {
            onAcceptInvite(notification.id, notification.classId);
        }
    };

    const handleReject = () => {
        if (notification.classId && onRejectInvite) {
            onRejectInvite(notification.id, notification.classId);
        }
    };

    return (
        <Card className='overflow-hidden hover:shadow-md transition-shadow hover:border-primary/30'>
            <CardContent className='p-6'>
                <div className='flex items-start gap-3'>
                    <div className='flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center'>
                        {notification.type === 'invite' ? <Users className='w-4 h-4' /> : <Bell className='w-4 h-4' />}
                    </div>
                    <div className='flex-1 min-w-0'>
                        <h3 className='font-bold text-lg mb-2 line-clamp-2 text-foreground'>{notification.message}</h3>
                        <p className='text-muted-foreground text-sm mb-4 line-clamp-3'>{notification.description}</p>
                        {notification.type === 'invite' && notification.className && (
                            <div className='mb-3'>
                                <span className='text-sm text-primary font-medium'>
                                    Class: {notification.className}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>

            <CardFooter className='py-3 px-6 border-t flex justify-between items-center'>
                <div className='flex items-center text-xs text-muted-foreground'>
                    <Clock className='h-3 w-3 mr-1' />
                    <span>{timeAgo}</span>
                </div>
                {notification.type === 'invite' && (
                    <div className='flex gap-2'>
                        <Button size='sm' onClick={handleAccept} className='text-xs'>
                            <Check className='w-3 h-3 mr-1' />
                            Accept
                        </Button>
                        <Button size='sm' variant='outline' onClick={handleReject} className='text-xs'>
                            <X className='w-3 h-3 mr-1' />
                            Decline
                        </Button>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
};
