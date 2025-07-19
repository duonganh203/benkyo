import { Card } from './ui/card';

const StatCard = ({ icon: Icon, label, value }: any) => (
    <Card className='p-4 min-w-0'>
        <div className='flex items-center gap-3'>
            <div className='p-2 bg-primary/10 rounded-lg flex-shrink-0'>
                <Icon className='w-5 h-5 text-primary' />
            </div>
            <div className='flex-1 min-w-0'>
                <div className='text-2xl font-bold'>{value}</div>
                <div className='text-sm text-muted-foreground font-medium'>{label}</div>
            </div>
        </div>
    </Card>
);
export default StatCard;
