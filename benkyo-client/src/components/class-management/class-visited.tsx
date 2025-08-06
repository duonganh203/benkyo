import { Eye, Clock, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import useClassManagementStore from '@/hooks/stores/use-class-management-store';
import useGetClassVisited from '@/hooks/queries/use-get-class-visited';

export const ClassVisited = () => {
    const { classData } = useClassManagementStore();
    const { data: visitedUsers, isLoading, error } = useGetClassVisited(classData?._id || '');

    if (!classData) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Eye className='w-5 h-5' />
                        Visited Users
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='text-center py-8 text-muted-foreground'>No class data available</div>
                </CardContent>
            </Card>
        );
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Eye className='w-5 h-5' />
                        Visited Users
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='text-center py-8 text-muted-foreground'>Loading visited users...</div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Eye className='w-5 h-5' />
                        Visited Users
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='text-center py-8 text-muted-foreground'>Error loading visited users</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <Eye className='w-5 h-5' />
                    Visited Users ({visitedUsers?.length || 0})
                </CardTitle>
            </CardHeader>
            <CardContent>
                {!visitedUsers || visitedUsers.length === 0 ? (
                    <div className='text-center py-12 text-muted-foreground'>
                        <Eye className='w-12 h-12 mx-auto mb-4 opacity-50' />
                        <p className='text-lg font-medium'>No visited users found</p>
                        <p className='text-sm mt-2'>Users who visit this class will appear here</p>
                    </div>
                ) : (
                    <div className='grid gap-4'>
                        {visitedUsers.map((visitedUser: any) => (
                            <div
                                key={visitedUser._id}
                                className='group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md'
                            >
                                <div className='flex items-start gap-4'>
                                    <div className='relative'>
                                        <Avatar className='h-12 w-12 ring-2 ring-background'>
                                            <AvatarImage
                                                src={visitedUser.userId?.avatar}
                                                alt={visitedUser.userId?.name}
                                            />
                                            <AvatarFallback className='text-sm font-medium bg-primary/10 text-primary'>
                                                {visitedUser.userId?.name
                                                    ? visitedUser.userId.name.charAt(0).toUpperCase()
                                                    : 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className='absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-background'></div>
                                    </div>

                                    <div className='flex-1 min-w-0'>
                                        <div className='flex items-center justify-between mb-2'>
                                            <div>
                                                <h3 className='font-semibold text-foreground truncate'>
                                                    {visitedUser.userId?.name || 'Unknown User'}
                                                </h3>
                                                <p className='text-sm text-muted-foreground truncate'>
                                                    {visitedUser.userId?.email}
                                                </p>
                                            </div>
                                            <div className='text-right'>
                                                <div className='text-sm font-medium text-foreground'>
                                                    {new Date(visitedUser.lastVisit).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                                <div className='text-xs text-muted-foreground'>last visit</div>
                                            </div>
                                        </div>

                                        <div className='flex items-center gap-3'>
                                            <Badge variant='secondary' className='text-xs'>
                                                <Calendar className='w-3 h-3 mr-1' />
                                                {new Date(visitedUser.lastVisit).toLocaleDateString([], {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </Badge>
                                            <Badge variant='outline' className='text-xs'>
                                                <Clock className='w-3 h-3 mr-1' />
                                                {new Date(visitedUser.lastVisit).toLocaleDateString([], {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
