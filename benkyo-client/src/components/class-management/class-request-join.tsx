import { Shield, UserCheck, UserX, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useEffect } from 'react';
import useClassRequestJoinStore from '@/hooks/stores/use-class-request-join-store';
import useClassManagementStore from '@/hooks/stores/use-class-management-store';
import useAcceptJoinClass from '@/hooks/queries/use-accept-join-request';
import useRejectJoinClass from '@/hooks/queries/use-reject-join-request';
import { getToast } from '@/utils/getToast';

const RequestItem = ({
    request,
    onAccept,
    onReject
}: {
    request: any;
    onAccept: (userId: string) => void;
    onReject: (userId: string) => void;
}) => (
    <div className='flex items-center justify-between p-4 bg-muted/30 rounded-lg border'>
        <div className='flex items-center gap-4 flex-1'>
            <Avatar className='w-10 h-10'>
                <AvatarImage src={request.user?.avatar} alt={request.user?.name} />
                <AvatarFallback className='text-sm'>
                    {request.user?.name ? request.user.name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
            </Avatar>
            <div className='flex-1 min-w-0'>
                <div className='font-medium text-foreground truncate'>{request.user?.name || 'Unknown User'}</div>
                <div className='text-sm text-muted-foreground truncate'>{request.user?.email}</div>
                <div className='flex items-center gap-2 mt-1'>
                    <Badge variant='outline' className='text-xs'>
                        <Clock className='w-3 h-3 mr-1' />
                        Requested {new Date(request.requestDate).toLocaleDateString()}
                    </Badge>
                    {request.status === 'PENDING' && (
                        <Badge variant='secondary' className='text-xs'>
                            Pending
                        </Badge>
                    )}
                </div>
                {request.message && <div className='mt-2 text-sm text-muted-foreground'>"{request.message}"</div>}
            </div>
        </div>
        <div className='flex gap-2'>
            <Button
                size='sm'
                className='bg-green-600 hover:bg-green-700 text-white'
                onClick={() => onAccept(request.user?._id)}
            >
                <UserCheck className='w-4 h-4 mr-1' />
                Approve
            </Button>
            <Button
                size='sm'
                variant='outline'
                className='border-red-300 text-red-600 hover:bg-red-50'
                onClick={() => onReject(request.user?._id)}
            >
                <UserX className='w-4 h-4 mr-1' />
                Decline
            </Button>
        </div>
    </div>
);

const LoadingState = () => (
    <Card>
        <CardHeader>
            <CardTitle className='flex items-center gap-2'>
                <Shield className='w-5 h-5' />
                Join Requests
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className='text-center py-8 text-muted-foreground'>Loading join requests...</div>
        </CardContent>
    </Card>
);

const ErrorState = () => (
    <Card>
        <CardHeader>
            <CardTitle className='flex items-center gap-2'>
                <Shield className='w-5 h-5' />
                Join Requests
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className='text-center py-8 text-muted-foreground'>Error loading join requests</div>
        </CardContent>
    </Card>
);

const NoDataState = () => (
    <Card>
        <CardHeader>
            <CardTitle className='flex items-center gap-2'>
                <Shield className='w-5 h-5' />
                Join Requests
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className='text-center py-8 text-muted-foreground'>No class data available</div>
        </CardContent>
    </Card>
);

const EmptyRequestsState = () => (
    <div className='text-center py-8 text-muted-foreground'>
        <Shield className='w-8 h-8 mx-auto mb-2 opacity-50' />
        <p>No join requests found</p>
    </div>
);

interface ClassRequestJoinProps {
    onMemberChange?: () => void;
}

export const ClassRequestJoin = ({ onMemberChange }: ClassRequestJoinProps) => {
    const { classData } = useClassManagementStore();
    const { joinRequests, isLoading, error, fetchJoinRequests } = useClassRequestJoinStore();
    const { mutateAsync: acceptRequest } = useAcceptJoinClass();
    const { mutateAsync: rejectRequest } = useRejectJoinClass();

    useEffect(() => {
        if (classData?._id) {
            fetchJoinRequests(classData._id);
        }
    }, [classData?._id, fetchJoinRequests]);

    if (!classData) {
        return <NoDataState />;
    }

    const handleAcceptRequest = async (userId: string) => {
        acceptRequest(
            { classId: classData._id, userId },
            {
                onSuccess: () => {
                    getToast('success', 'Join request accepted successfully');
                    fetchJoinRequests(classData._id);
                    onMemberChange?.();
                },
                onError: (error: any) => {
                    getToast('error', error.message);
                    console.log(error);
                }
            }
        );
    };

    const handleRejectRequest = async (userId: string) => {
        rejectRequest(
            { classId: classData._id, userId },
            {
                onSuccess: () => {
                    getToast('success', 'Join request rejected successfully');
                    fetchJoinRequests(classData._id);
                    onMemberChange?.();
                },
                onError: (error: any) => {
                    getToast('error', error.message);
                    console.log(error);
                }
            }
        );
    };

    if (isLoading) {
        return <LoadingState />;
    }

    if (error) {
        return <ErrorState />;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <Shield className='w-5 h-5' />
                    Join Requests ({joinRequests?.length || 0})
                </CardTitle>
            </CardHeader>
            <CardContent>
                {!joinRequests || joinRequests.length === 0 ? (
                    <EmptyRequestsState />
                ) : (
                    <div className='space-y-4'>
                        {joinRequests.map((request: any) => (
                            <RequestItem
                                key={request._id}
                                request={request}
                                onAccept={handleAcceptRequest}
                                onReject={handleRejectRequest}
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
