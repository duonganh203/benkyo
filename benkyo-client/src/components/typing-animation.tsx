import { cn } from '@/lib/utils';

export const TypingAnimation = () => {
    return (
        <div className='flex space-x-1 items-center'>
            <div className='w-2 h-2 rounded-full bg-current animate-bounce' style={{ animationDelay: '0ms' }} />
            <div className='w-2 h-2 rounded-full bg-current animate-bounce' style={{ animationDelay: '150ms' }} />
            <div className='w-2 h-2 rounded-full bg-current animate-bounce' style={{ animationDelay: '300ms' }} />
        </div>
    );
};

export const TypingIndicator = ({ className }: { className?: string }) => {
    return (
        <div className={cn('flex items-center space-x-2 text-muted-foreground', className)}>
            <TypingAnimation />
            <span className='text-xs'>AI is thinking...</span>
        </div>
    );
};
