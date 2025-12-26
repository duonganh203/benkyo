import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import StatCard from '@/components/stat-card';
import { useGetClassMonthlyAccessStats } from '@/hooks/queries/use-get-class-monthly-access-stats';
import { Globe, Lock, QrCode } from 'lucide-react';
import QRCodeClass from '@/components/qr-code-class';
import type { ClassManagementResponseDto } from '@/types/class';

const MonthlyAccessChart = ({ classId }: { classId: string }) => {
    const { data: monthlyStats, isLoading, error } = useGetClassMonthlyAccessStats(classId);

    if (isLoading) {
        return (
            <div className='space-y-4'>
                <div className='text-center py-8 text-muted-foreground'>Loading monthly statistics...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='space-y-4'>
                <div className='text-center py-8 text-muted-foreground'>Error loading monthly statistics</div>
            </div>
        );
    }

    if (!monthlyStats || monthlyStats.length === 0) {
        return (
            <div className='space-y-4'>
                <div className='text-center py-8 text-muted-foreground'>No monthly statistics available</div>
            </div>
        );
    }

    const chartData = monthlyStats.map((stat) => {
        return {
            month: stat.month,
            visits: stat.visits,
            members: stat.members,
            uniqueVisitors: stat.uniqueVisitors
        };
    });

    if (chartData.length === 0) {
        return (
            <div className='space-y-4'>
                <div className='text-center py-8 text-muted-foreground'>No valid monthly statistics available</div>
            </div>
        );
    }

    return (
        <div className='space-y-6'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Visits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width='100%' height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray='3 3' />
                                <XAxis dataKey='month' />
                                <YAxis />
                                <Tooltip />
                                <Line type='monotone' dataKey='visits' stroke='#8884d8' strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Member Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width='100%' height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray='3 3' />
                                <XAxis dataKey='month' />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey='members' fill='#82ca9d' />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

interface ClassOverviewProps {
    classItem: ClassManagementResponseDto;
    classId: string;
}

export const ClassOverview = ({ classItem, classId }: ClassOverviewProps) => (
    <div className='space-y-8'>
        <Card className='relative overflow-hidden'>
            <div
                className='absolute inset-0 bg-cover bg-center'
                style={{
                    backgroundImage: `url(${classItem.bannerUrl || '/default-class-banner.svg'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                <div className='absolute inset-0 bg-black/40'></div>
            </div>
            <div className='relative p-8'>
                <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                        <div className='mb-4'>
                            <div className='flex items-center gap-2 mb-2'>
                                <span className='font-medium text-white '>Name:</span>
                                <h1 className='text-3xl font-bold text-white line-clamp-2'>{classItem.name}</h1>
                            </div>
                            <div className='flex items-start gap-2'>
                                <span className='font-medium text-white mt-1'>Description:</span>
                                <p className='text-lg text-white/90'>{classItem.description || 'No description'}</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-6 text-white/90'>
                            <div className='flex items-center gap-2'>
                                <span className='font-medium text-white'>ID:</span>
                                <code className='px-2 py-1 bg-background/40 backdrop-blur-sm rounded text-sm font-mono text-white'>
                                    {classItem._id}
                                </code>
                            </div>
                            <div className='flex items-center gap-2'>
                                <span className='font-medium text-white'>Created:</span>
                                <span className='text-white/90'>
                                    {classItem.createdAt ? new Date(classItem.createdAt).toLocaleDateString() : '-'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className='flex items-center gap-2'>
                        <Badge
                            variant={classItem.visibility === 'public' ? 'default' : 'secondary'}
                            className='text-sm px-3 py-1 bg-background/40 backdrop-blur-sm text-white border-white/30'
                        >
                            {classItem.visibility === 'public' ? (
                                <Globe className='w-4 h-4 mr-1' />
                            ) : (
                                <Lock className='w-4 h-4 mr-1' />
                            )}
                            {classItem.visibility}
                        </Badge>
                    </div>
                </div>
            </div>
        </Card>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            <StatCard
                title='Total Members'
                value={classItem.users?.length || 0}
                icon='users'
                description='Active members in class'
            />
            <StatCard
                title='Total Decks'
                value={classItem.decks?.length || 0}
                icon='book'
                description='Available study decks'
            />
            <StatCard
                title='Join Requests'
                value={Array.isArray(classItem.joinRequests) ? classItem.joinRequests.length : 0}
                icon='user-plus'
                description='Pending join requests'
            />
            <StatCard
                title='Invited Users'
                value={Array.isArray(classItem.invitedUsers) ? classItem.invitedUsers.length : 0}
                icon='mail'
                description='Users invited to class'
            />
            <StatCard
                title='Recent Visits'
                value={Array.isArray(classItem.visited) ? classItem.visited.length : 0}
                icon='eye'
                description='Recent class visits'
            />
            <StatCard
                title='Overdue Members'
                value={classItem.overdueMemberCount || 0}
                icon='alert-triangle'
                description='Members with overdue tasks'
            />
        </div>

        <Separator />

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
                <CardHeader>
                    <CardTitle>Class Information</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='flex items-center'>
                        <span className='text-muted-foreground w-32 flex-shrink-0'>Name:</span>
                        <span className='font-medium'>{classItem.name}</span>
                    </div>
                    <div className='flex items-center'>
                        <span className='text-muted-foreground w-32 flex-shrink-0'>Description:</span>
                        <span className='font-medium'>{classItem.description || 'No description'}</span>
                    </div>
                    <div className='flex items-center'>
                        <span className='text-muted-foreground w-32 flex-shrink-0'>Visibility:</span>
                        <Badge variant={classItem.visibility === 'public' ? 'default' : 'secondary'}>
                            {classItem.visibility}
                        </Badge>
                    </div>
                    <div className='flex items-center'>
                        <span className='text-muted-foreground w-32 flex-shrink-0'>Join Approval:</span>
                        <Badge variant={classItem.requiredApprovalToJoin ? 'destructive' : 'default'}>
                            {classItem.requiredApprovalToJoin ? 'Required' : 'Not Required'}
                        </Badge>
                    </div>
                    <div className='flex items-center'>
                        <span className='text-muted-foreground w-32 flex-shrink-0'>Created:</span>
                        <span className='font-medium'>
                            {classItem.createdAt ? new Date(classItem.createdAt).toLocaleDateString() : '-'}
                        </span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <QrCode className='w-5 h-5' />
                        Join Class QR Code
                    </CardTitle>
                </CardHeader>
                <CardContent className='flex flex-col items-center space-y-6 py-6'>
                    <QRCodeClass classId={classId} size={200} />
                    <div className='text-center space-y-2'>
                        <p className='text-sm text-muted-foreground'>Scan this QR code to join the class</p>
                        <p className='text-xs text-muted-foreground'>Share with others who want to join</p>
                    </div>
                </CardContent>
            </Card>
        </div>

        <Separator />

        <MonthlyAccessChart classId={classId} />
    </div>
);
