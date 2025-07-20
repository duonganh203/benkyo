import { UserCheck, Users, UserX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { Button } from './ui/button';
import { ClassManagementResponseDto, JoinRequest } from '@/types/class';

type JoinRequestsSectionProps = {
    classItem: ClassManagementResponseDto;
    onAccept: (requestId: string) => void;
    onReject: (requestId: string) => void;
};

const JoinRequestsSection = ({ classItem, onAccept, onReject }: JoinRequestsSectionProps) => {
    if (!classItem.joinRequests || classItem.joinRequests.length === 0) return null;

    return (
        <Card className='mt-6'>
            <CardHeader className='pb-3'>
                <CardTitle className='flex items-center gap-2 text-lg'>
                    <Users className='w-5 h-5' />
                    Join Requests ({classItem.joinRequests.length})
                </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
                {classItem.joinRequests.map((request: JoinRequest) => (
                    <div
                        key={request.user._id}
                        className='flex items-center justify-between p-4 bg-muted/50 rounded-lg border'
                    >
                        <div className='flex items-center gap-4 flex-1'>
                            <Avatar className='w-12 h-12'>
                                <AvatarImage src={request.user?.avatar} alt={request.user?.name} />
                                <AvatarFallback className='text-sm'>
                                    {request.user?.name
                                        ?.split(' ')
                                        .map((n: string) => n[0])
                                        .join('')
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className='flex-1 min-w-0'>
                                <div className='font-semibold text-foreground truncate'>{request.user?.name}</div>
                                <div className='text-sm text-muted-foreground truncate'>{request.user?.email}</div>
                                <div className='text-xs text-muted-foreground mt-1'>
                                    {new Date(request.requestDate).toLocaleString()}
                                </div>
                            </div>
                        </div>
                        <div className='flex gap-2 ml-4'>
                            <Button
                                size='sm'
                                className='bg-green-600 hover:bg-green-700'
                                onClick={() => onAccept(request.user._id)}
                            >
                                <UserCheck className='w-4 h-4 mr-1' />
                                Accept
                            </Button>
                            <Button size='sm' variant='destructive' onClick={() => onReject(request.user._id)}>
                                <UserX className='w-4 h-4 mr-1' />
                                Reject
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

export default JoinRequestsSection;
