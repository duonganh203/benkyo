import { Info } from 'lucide-react';
import { Button } from './ui/button';
import { useFSRSInfoModal } from '@/hooks/stores/use-fsrs-info-modal';

interface FSRSInfoButtonProps {
    variant?: 'icon' | 'button';
    size?: 'sm' | 'default' | 'lg';
    className?: string;
}

export const FSRSInfoButton = ({ variant = 'icon', size = 'default', className = '' }: FSRSInfoButtonProps) => {
    const { open } = useFSRSInfoModal((store) => store);

    if (variant === 'icon') {
        return (
            <Button
                variant='outline'
                size='icon'
                type='button'
                className={`h-8 w-8 rounded-full hover:bg-primary/10 ${className}`}
                onClick={open}
            >
                <Info className='h-4 w-4' />
            </Button>
        );
    }

    return (
        <Button variant='outline' size={size} className={`gap-2 ${className}`} type='button' onClick={open}>
            <Info className='h-4 w-4' />
            FSRS Info
        </Button>
    );
};
