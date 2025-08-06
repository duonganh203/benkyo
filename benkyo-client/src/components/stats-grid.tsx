import { Card } from '@/components/ui/card';
import { Users, Eye, Calendar, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { useGetClassMonthlyAccessStats } from '@/hooks/queries/use-get-class-monthly-access-stats';
import useAuthStore from '@/hooks/stores/use-auth-store';
import useClassManagementStore from '@/hooks/stores/use-class-management-store';
import { useNavigate } from 'react-router-dom';
import { getToast } from '@/utils/getToast';

const StatsGrid = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const { classData } = useClassManagementStore();

    if (!classData) {
        return (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6'>
                <div className='text-center py-8 text-muted-foreground'>No class data available</div>
            </div>
        );
    }

    const { data: monthlyStats, isError, error } = useGetClassMonthlyAccessStats(classData._id);

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

    const todayVisits =
        monthlyStats?.find((stat) => format(new Date(stat.month), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
            ?.visits || 0;
    const stats = [
        {
            icon: Users,
            label: 'Total Learners',
            value: classData.users?.length || 0,
            delay: '0s'
        },
        {
            icon: Eye,
            label: 'Visits Today',
            value: todayVisits,
            delay: '0.1s'
        },
        {
            icon: Calendar,
            label: 'Founded Date',
            value: format(new Date(classData.createdAt), 'dd/MM/yyyy'),
            delay: '0.2s'
        },
        {
            icon: AlertTriangle,
            label: 'Users Late/Overdue',
            value: classData.overdueMemberCount || 0,
            delay: '0.4s'
        }
    ];

    return (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6'>
            {stats.map((stat, index) => {
                const Icon = stat.icon;

                return (
                    <Card
                        key={index}
                        className='p-6 flex items-center space-x-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-bounce-in'
                        style={{ animationDelay: stat.delay }}
                    >
                        <div className='flex-shrink-0 p-3 border rounded-full bg-background'>
                            <Icon className='h-6 w-6 text-primary' />
                        </div>

                        <div>
                            <p className='text-sm text-muted-foreground'>{stat.label}</p>
                            <p className='text-2xl font-bold text-foreground'>{stat.value}</p>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};

export default StatsGrid;
