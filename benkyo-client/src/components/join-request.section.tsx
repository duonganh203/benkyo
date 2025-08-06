import { UserCheck, UserX, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback } from '@radix-ui/react-avatar';
import { Button } from './ui/button';
import { ClassJoinRequestItem } from '@/types/class';
import { useGetClassRequestJoin } from '@/hooks/queries/use-get-class-request-join';
import useAuthStore from '@/hooks/stores/use-auth-store';
import useClassManagementStore from '@/hooks/stores/use-class-management-store';
import { useNavigate } from 'react-router-dom';
import { getToast } from '@/utils/getToast';

type JoinRequestsSectionProps = {
    onAccept: (requestId: string) => void;
    onReject: (requestId: string) => void;
};

const JoinRequestsSection = ({ onAccept, onReject }: JoinRequestsSectionProps) => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const { classData } = useClassManagementStore();

    if (!classData) {
        return null;
    }

    const { data: joinRequests, isLoading, isError, error } = useGetClassRequestJoin(classData._id);

    if (!user) {
        navigate('/login');
        getToast('error', 'You must be logged in to continue.');
        return null;
    }

    if (isError) {
        getToast('error', `${error?.message}`);
        console.log(error);
        return null;
    }

    if (isLoading) {
        return (
            <Card className='mt-6'>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Shield className='w-5 h-5 text-blue-600' />
                        Join Requests
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='text-center py-8 text-muted-foreground'>Loading join requests...</div>
                </CardContent>
            </Card>
        );
    }

    if (!joinRequests || joinRequests.length === 0) {
        return null;
    }

    return (
        <Card className='mt-6'>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <Shield className='w-5 h-5 text-blue-600' />
                    Join Requests ({joinRequests.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className='space-y-4'>
                    {joinRequests.map((request: ClassJoinRequestItem, index: number) => (
                        <div
                            key={index}
                            className='flex items-center justify-between p-4 bg-muted/30 rounded-lg border'
                        >
                            <div className='flex items-center gap-4 flex-1'>
                                <Avatar className='w-10 h-10'>
                                    <AvatarFallback className='text-sm'>
                                        {request.user ? request.user.charAt(0).toUpperCase() : 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className='flex-1 min-w-0'>
                                    <div className='font-medium text-foreground truncate'>
                                        {request.user || 'Unknown User'}
                                    </div>
                                    <div className='text-sm text-muted-foreground truncate'>{request.user}</div>
                                    <div className='text-xs text-muted-foreground mt-1'>
                                        Requested: {new Date(request.requestDate).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <div className='flex gap-2'>
                                <Button
                                    size='sm'
                                    className='bg-green-600 hover:bg-green-700 text-white'
                                    onClick={() => onAccept(request.user)}
                                >
                                    <UserCheck className='w-4 h-4 mr-1' />
                                    Approve
                                </Button>
                                <Button
                                    size='sm'
                                    variant='outline'
                                    className='border-red-300 text-red-600 hover:bg-red-50'
                                    onClick={() => onReject(request.user)}
                                >
                                    <UserX className='w-4 h-4 mr-1' />
                                    Decline
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default JoinRequestsSection;
