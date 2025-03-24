import React, { useCallback } from 'react';
import {
    PieChart as RPieChart,
    Pie,
    Cell,
    BarChart as RBarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartData {
    name: string;
    value: number;
    color: string;
}

export const PieChart = ({ data }: { data: ChartData[] }) => {
    const total = data.reduce((sum, entry) => sum + entry.value, 0);

    if (total === 0) {
        return (
            <div className='flex items-center justify-center h-full w-full'>
                <p className='text-muted-foreground text-sm'>No data available</p>
            </div>
        );
    }

    const renderCustomizedLabel = useCallback(({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent < 0.05) return null;

        return (
            <text
                x={x}
                y={y}
                fill='white'
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline='central'
                fontSize={12}
                fontWeight='bold'
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    }, []);

    return (
        <div className='w-full h-full flex flex-col'>
            <div className='flex-1'>
                <ResponsiveContainer width='100%' height='100%'>
                    <RPieChart>
                        <Pie
                            data={data}
                            cx='50%'
                            cy='50%'
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={80}
                            fill='#8884d8'
                            dataKey='value'
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </RPieChart>
                </ResponsiveContainer>
            </div>
            <div className='mt-2 flex justify-center items-center gap-4'>
                {data.map((entry, index) => (
                    <div key={`legend-${index}`} className='flex items-center gap-1'>
                        <div className='w-3 h-3 rounded-full' style={{ backgroundColor: entry.color }} />
                        <span className='text-xs'>
                            {entry.name} ({entry.value})
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const BarChart = ({ data }: { data: any[] }) => {
    return (
        <ResponsiveContainer width='100%' height='100%'>
            <RBarChart
                data={data}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5
                }}
            >
                <XAxis dataKey='name' tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey='value' fill='#8884d8' />
            </RBarChart>
        </ResponsiveContainer>
    );
};

export const ChartCard = ({
    title,
    children,
    className
}: {
    title: string;
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <Card className={className}>
            <CardHeader className='pb-2'>
                <CardTitle className='text-lg font-medium'>{title}</CardTitle>
            </CardHeader>
            <CardContent className='pt-0'>
                <div className='h-[200px]'>{children}</div>
            </CardContent>
        </Card>
    );
};
