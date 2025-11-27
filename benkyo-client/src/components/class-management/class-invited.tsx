import { useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Mail, UserX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import useClassManagementStore from '@/hooks/stores/use-class-management-store';
import useCancelInvite from '@/hooks/queries/use-cancel-invite';
import useGetClassInvited from '@/hooks/queries/use-get-class-invited';
import { getToast } from '@/utils/getToast';

export const ClassInvited = () => {
    const { classData } = useClassManagementStore();
    const {
        data: pagedInvited,
        isLoading,
        error,
        hasNextPage,
        fetchNextPage,
        refetch
    } = useGetClassInvited(classData?._id || '', 10);

    const { mutateAsync: cancelInvite } = useCancelInvite();

    const invitedUsers = useMemo(() => {
        if (!pagedInvited) return [];
        return pagedInvited.pages.flatMap((page) => page.data);
    }, [pagedInvited]);

    if (!classData) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Mail className='w-5 h-5' />
                        Invited Users
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='text-center py-8 text-muted-foreground'>No class data available</div>
                </CardContent>
            </Card>
        );
    }

    const handleCancelInvite = async (userId: string) => {
        if (!classData?._id) {
            getToast('error', 'Class data not available');
            return;
        }
        cancelInvite({ classId: classData._id, userId }).then(() => refetch());
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Mail className='w-5 h-5' />
                        Invited Users
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='text-center py-8 text-muted-foreground'>Loading invited users...</div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Mail className='w-5 h-5' />
                        Invited Users
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='text-center py-8 text-muted-foreground'>Error loading invited users</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <Mail className='w-5 h-5' />
                    Invited Users ({invitedUsers.length || 0})
                </CardTitle>
            </CardHeader>
            <CardContent>
                {!invitedUsers || invitedUsers.length === 0 ? (
                    <div className='text-center py-8 text-muted-foreground'>
                        <Mail className='w-8 h-8 mx-auto mb-2 opacity-50' />
                        <p>No invited users found</p>
                    </div>
                ) : (
                    <div id='class-invited-scrollable' className='space-y-4 max-h-[400px] overflow-y-auto pr-1'>
                        <InfiniteScroll
                            dataLength={invitedUsers.length}
                            next={() => fetchNextPage()}
                            hasMore={!!hasNextPage}
                            loader={
                                <div className='flex justify-center py-2 text-xs text-muted-foreground'>
                                    Loading more invited users...
                                </div>
                            }
                            scrollableTarget='class-invited-scrollable'
                            style={{ overflow: 'visible' }}
                        >
                            {invitedUsers.map((invitedUser) => (
                                <div
                                    key={invitedUser._id}
                                    className='flex items-center justify-between p-4 bg-muted/30 rounded-lg border'
                                >
                                    <div className='flex items-center gap-4 flex-1'>
                                        <Avatar className='w-10 h-10'>
                                            <AvatarImage src={invitedUser.user?.avatar} alt={invitedUser.user?.name} />
                                            <AvatarFallback className='text-sm'>
                                                {invitedUser.user?.name
                                                    ? invitedUser.user.name.charAt(0).toUpperCase()
                                                    : 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className='flex-1 min-w-0'>
                                            <div className='font-medium text-foreground truncate'>
                                                {invitedUser.user?.name || 'Unknown User'}
                                            </div>
                                            <div className='text-sm text-muted-foreground truncate'>
                                                {invitedUser.user?.email}
                                            </div>
                                        </div>
                                    </div>
                                    <div className='flex gap-2'>
                                        <Button
                                            size='sm'
                                            variant='outline'
                                            onClick={() => {
                                                navigator.clipboard.writeText(invitedUser.user?.email || '');
                                                getToast('success', 'Email copied to clipboard');
                                            }}
                                        >
                                            Copy Email
                                        </Button>
                                        <Button
                                            size='sm'
                                            variant='outline'
                                            className='border-red-300 text-red-600 hover:bg-red-50'
                                            onClick={() => handleCancelInvite(invitedUser.user?._id || invitedUser._id)}
                                        >
                                            <UserX className='w-4 h-4 mr-1' />
                                            Cancel Invite
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </InfiniteScroll>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
