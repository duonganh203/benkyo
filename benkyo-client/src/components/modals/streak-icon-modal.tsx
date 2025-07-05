import { useStudyStreakTimer } from '@/hooks/queries/use-study-streak-timer';

import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';

export const StreakIconModal = () => {
    const streak = useStudyStreakTimer();
    if (!streak) return null;
    return (
        <div className='fixed bottom-10 right-20 z-50 flex flex-col items-center gap-2 animate-[gentle-bounce_1.8s_ease-in-out_infinite]'>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className='px-3 py-1.5 text-sm font-medium text-white bg-violet-500 border border-violet-200 rounded-lg shadow-md'
            >
                You've studied for {streak} consecutive days!
            </motion.div>

            <motion.div className='relative w-16 h-16 cursor-pointer animate-gentle-bounce'>
                <div className='absolute inset-0 bg-gradient-to-br from-indigo-400 via-violet-500 to-blue-500 rounded-full blur-xl opacity-40 animate-pulse'></div>
                <div className='absolute inset-1 bg-gradient-to-br from-white/70 to-transparent rounded-full blur-sm opacity-80'></div>

                <div className='relative w-16 h-16 bg-white/90 backdrop-blur-sm border border-violet-300 rounded-full shadow-2xl flex items-center justify-center'>
                    <div className='absolute inset-1 bg-gradient-to-br from-indigo-100/30 to-transparent rounded-full'></div>
                    <Flame className='w-10 h-10 text-violet-500 drop-shadow-md relative z-10' />
                </div>

                <div className='absolute -top-1 -right-1 w-2 h-2 bg-violet-300 rounded-full animate-bounce opacity-70'></div>
                <div className='absolute -bottom-1 -left-1 w-1 h-1 bg-blue-300 rounded-full animate-pulse'></div>
                <div className='absolute top-1 -left-2 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-300 opacity-80'></div>
            </motion.div>
        </div>
    );
};
