import React from 'react';

const StatItem = ({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) => (
    <div className='text-center'>
        <div className='flex items-center justify-center mb-1'>{icon}</div>
        <p className='text-sm font-semibold'>{value}</p>
        <p className='text-xs text-gray-500 dark:text-gray-400'>{label}</p>
    </div>
);

export default StatItem;
