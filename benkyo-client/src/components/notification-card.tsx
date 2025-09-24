import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Bell, Users, Check, X, Clock, Shield } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { UnifiedNotification } from '@/types/class';

interface NotificationCardProps {
    notification: UnifiedNotification;
    onAcceptInvite?: (classId: string, requestUserId?: string) => void;
    onRejectInvite?: (classId: string, requestUserId?: string) => void;
}

export const NotificationCard = ({ notification, onAcceptInvite, onRejectInvite }: NotificationCardProps) => {
    const isMembership = notification.notificationType === 'invite' || notification.notificationType === 'join_request';

    const time = 'sortTime' in notification ? notification.sortTime : new Date(notification.createdAt);
    const timeAgo = formatDistanceToNow(new Date(time), {
        addSuffix: true,
        locale: vi
    });

    const handleAccept = () => {
        if (!onAcceptInvite || !notification.classId) return;
        const requestUserId = notification.notificationType === 'join_request' ? notification.requestUserId : undefined;
        onAcceptInvite(notification.classId, requestUserId);
    };

    const handleReject = () => {
        if (!onRejectInvite || !notification.classId) return;
        const requestUserId = notification.notificationType === 'join_request' ? notification.requestUserId : undefined;
        onRejectInvite(notification.classId, requestUserId);
    };

    return (
        <Card className='overflow-hidden hover:shadow-md transition-shadow hover:border-primary/30'>
            <CardContent className='p-6'>
                <div className='flex items-start gap-3'>
                    <div className='flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center'>
                        {isMembership ? <Users className='w-4 h-4' /> : <Bell className='w-4 h-4' />}
                    </div>
                    <div className='flex-1 min-w-0'>
                        <h3 className='font-bold text-lg mb-2 line-clamp-2 text-foreground'>{notification.message}</h3>
                        <p className='text-muted-foreground text-sm mb-4 line-clamp-3'>{notification.description}</p>
                        {notification.className && (
                            <div className='mb-3'>
                                <span className='text-sm text-primary font-medium'>
                                    Class: {notification.className}
                                </span>
                            </div>
                        )}
                        {notification.notificationType === 'join_request' && (
                            <div className='text-sm text-muted-foreground'>
                                <Shield className='inline w-3 h-3 mr-1' />
                                Request from {notification.requestUserName} ({notification.requestUserEmail})
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>

            {isMembership && (
                <CardFooter className='py-3 px-6 border-t flex justify-between items-center'>
                    <div className='flex items-center text-xs text-muted-foreground'>
                        <Clock className='h-3 w-3 mr-1' />
                        <span>{timeAgo}</span>
                    </div>
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
                </CardFooter>
            )}
        </Card>
    );
};
