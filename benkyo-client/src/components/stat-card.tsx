import { Card } from './ui/card';
import {
    Users,
    Book,
    Trophy,
    UserPlus,
    Activity,
    Clipboard,
    Mail,
    Eye,
    AlertTriangle,
    TrendingUp,
    Calendar,
    Clock
} from 'lucide-react';

interface StatCardProps {
    icon: string;
    title: string;
    value: string | number;
    description: string;
}

const StatCard = ({ icon, title, value, description }: StatCardProps) => {
    const getIconComponent = (iconName: string) => {
        switch (iconName) {
            case 'users':
                return <Users className='w-6 h-6' />;
            case 'book':
                return <Book className='w-6 h-6' />;
            case 'trophy':
                return <Trophy className='w-6 h-6' />;
            case 'user-plus':
                return <UserPlus className='w-6 h-6' />;
            case 'activity':
                return <Activity className='w-6 h-6' />;
            case 'clipboard':
                return <Clipboard className='w-6 h-6' />;
            case 'mail':
                return <Mail className='w-6 h-6' />;
            case 'eye':
                return <Eye className='w-6 h-6' />;
            case 'alert-triangle':
                return <AlertTriangle className='w-6 h-6' />;
            case 'trending-up':
                return <TrendingUp className='w-6 h-6' />;
            case 'calendar':
                return <Calendar className='w-6 h-6' />;
            case 'clock':
                return <Clock className='w-6 h-6' />;
            default:
                return <Users className='w-6 h-6' />;
        }
    };

    return (
        <Card className='p-6 hover:shadow-lg transition-all duration-200 border-0 bg-gradient-to-br from-background to-muted/20'>
            <div className='flex flex-col gap-4'>
                <div className='flex items-center justify-between'>
                    <div className='p-3 bg-primary/10 rounded-xl flex-shrink-0'>{getIconComponent(icon)}</div>
                    <div className='text-right'>
                        <div className='text-3xl font-bold text-primary'>{value}</div>
                    </div>
                </div>
                <div className='space-y-1'>
                    <div className='text-lg font-semibold text-foreground'>{title}</div>
                    <div className='text-sm text-muted-foreground leading-relaxed'>{description}</div>
                </div>
            </div>
        </Card>
    );
};

export default StatCard;
