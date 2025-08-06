import { Card } from '@/components/ui/card';
import { Users, Eye, Calendar, Trophy } from 'lucide-react';
import { format } from 'date-fns';

interface StatsGridProps {
    totalLearnersCount: number;
    createdAt: Date;
    completionRate: number;
    visited: number;
}

const StatsGrid = ({ totalLearnersCount, createdAt, visited, completionRate }: StatsGridProps) => {
    const stats = [
        {
            icon: Users,
            label: 'Total Learners',
            value: totalLearnersCount,
            delay: '0s'
        },
        {
            icon: Eye,
            label: 'Visits Today',
            value: visited,
            delay: '0.1s'
        },
        {
            icon: Calendar,
            label: 'Founded Date',
            value: format(new Date(createdAt), 'dd/MM/yyyy'),
            delay: '0.2s'
        },
        {
            icon: Trophy,
            label: 'Completion Rate',
            value: `${completionRate}%`,
            delay: '0.3s'
        }
    ];

    return (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
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
