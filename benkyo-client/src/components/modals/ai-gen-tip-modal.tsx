'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Lightbulb, BarChart, Sparkle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TipItem {
    icon: 'check' | 'x' | 'tip';
    content: string;
}

export interface TipsData {
    title: string;
    analysis: {
        items: string[];
    };
    strengths: {
        title: string;
        items: TipItem[];
    };
    weaknesses: {
        title: string;
        items: TipItem[];
    };
    tips: {
        title: string;
        items: TipItem[];
    };
}

interface AiTipsModalProps {
    buttonText?: string;
    data: TipsData | null;
    className?: string;
    open: boolean;
    onClose: () => void;
    isLoading?: boolean;
    trigger?: React.ReactNode;
}

export function AiTipsModal({ data, open, onClose, isLoading = false, trigger }: AiTipsModalProps) {
    const [visibleSections, setVisibleSections] = useState({
        analysis: false,
        strengths: false,
        weaknesses: false,
        tips: false
    });
    const [animationComplete, setAnimationComplete] = useState(false);

    // Reset animation state when modal closes
    useEffect(() => {
        if (!open) {
            setVisibleSections({
                analysis: false,
                strengths: false,
                weaknesses: false,
                tips: false
            });
            setAnimationComplete(false);
        } else if (data && !isLoading) {
            showSectionWithDelay('analysis', 100);
        }
    }, [open, data, isLoading]);

    const showSectionWithDelay = (section: keyof typeof visibleSections, delay: number) => {
        setTimeout(() => {
            setVisibleSections((prev) => ({ ...prev, [section]: true }));

            if (section === 'analysis') {
                showSectionWithDelay('strengths', 300);
            } else if (section === 'strengths') {
                showSectionWithDelay('weaknesses', 300);
            } else if (section === 'weaknesses') {
                showSectionWithDelay('tips', 300);
            } else if (section === 'tips') {
                setTimeout(() => setAnimationComplete(true), 300);
            }
        }, delay);
    };

    const renderIcon = (type: string) => {
        switch (type) {
            case 'check':
                return <CheckCircle className='h-5 w-5 text-green-500 mr-2 flex-shrink-0' />;
            case 'x':
                return <XCircle className='h-5 w-5 text-red-500 mr-2 flex-shrink-0' />;
            case 'tip':
                return <Lightbulb className='h-5 w-5 text-amber-500 mr-2 flex-shrink-0' />;
            default:
                return null;
        }
    };

    return (
        <>
            {trigger && <div className='cursor-pointer'>{trigger}</div>}

            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className='max-h-[80vh] overflow-y-auto sm:max-w-3xl'>
                    <DialogHeader>
                        <DialogTitle className='text-2xl font-bold'>
                            {isLoading ? 'Analyzing your performance...' : data?.title || 'AI Analysis'}
                        </DialogTitle>
                        <DialogDescription>
                            {isLoading
                                ? 'Please wait while we generate insights...'
                                : 'AI-generated analysis and tips for improvement'}
                        </DialogDescription>
                    </DialogHeader>

                    {isLoading ? (
                        <div className='flex flex-col items-center justify-center p-8 gap-4'>
                            <Sparkle className='h-8 w-8 text-primary animate-pulse' />
                            <p className='text-muted-foreground'>Generating personalized tips...</p>
                        </div>
                    ) : data ? (
                        <div className='p-4 pb-0'>
                            <Card
                                className={cn(
                                    'mb-4 transition-opacity duration-500',
                                    visibleSections.analysis ? 'opacity-100' : 'opacity-0'
                                )}
                            >
                                <CardHeader className='pb-2'>
                                    <CardTitle className='flex items-center text-lg'>
                                        <BarChart className='h-5 w-5 mr-2 text-blue-500' />
                                        Analysis
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className='space-y-2'>
                                        {data.analysis.items.map((item, index) => (
                                            <p key={index} className='text-sm'>
                                                {item}
                                            </p>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card
                                className={cn(
                                    'mb-4 border-green-100 dark:border-green-900 transition-opacity duration-500',
                                    visibleSections.strengths ? 'opacity-100' : 'opacity-0'
                                )}
                            >
                                <CardHeader className='pb-2 bg-green-50 dark:bg-green-950/30 rounded-t-lg'>
                                    <CardTitle className='flex items-center text-lg'>
                                        <CheckCircle className='h-5 w-5 mr-2 text-green-500' />
                                        {data.strengths.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className='pt-4'>
                                    <div className='space-y-3'>
                                        {data.strengths.items.map((item, index) => (
                                            <div key={index} className='flex items-start'>
                                                {renderIcon(item.icon)}
                                                <p className='text-sm'>{item.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card
                                className={cn(
                                    'mb-4 border-red-100 dark:border-red-900 transition-opacity duration-500',
                                    visibleSections.weaknesses ? 'opacity-100' : 'opacity-0'
                                )}
                            >
                                <CardHeader className='pb-2 bg-red-50 dark:bg-red-950/30 rounded-t-lg'>
                                    <CardTitle className='flex items-center text-lg'>
                                        <XCircle className='h-5 w-5 mr-2 text-red-500' />
                                        {data.weaknesses.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className='pt-4'>
                                    <div className='space-y-3'>
                                        {data.weaknesses.items.map((item, index) => (
                                            <div key={index} className='flex items-start'>
                                                {renderIcon(item.icon)}
                                                <p className='text-sm'>{item.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card
                                className={cn(
                                    'mb-4 border-amber-100 dark:border-amber-900 transition-opacity duration-500',
                                    visibleSections.tips ? 'opacity-100' : 'opacity-0'
                                )}
                            >
                                <CardHeader className='pb-2 bg-amber-50 dark:bg-amber-950/30 rounded-t-lg'>
                                    <CardTitle className='flex items-center text-lg'>
                                        <Lightbulb className='h-5 w-5 mr-2 text-amber-500' />
                                        {data.tips.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className='pt-4'>
                                    <div className='space-y-3'>
                                        {data.tips.items.map((item, index) => (
                                            <div key={index} className='flex items-start'>
                                                {renderIcon(item.icon)}
                                                <p className='text-sm whitespace-pre-wrap'>{item.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : null}

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant='outline'>
                                {animationComplete ? 'Close' : isLoading ? 'Cancel' : 'Skip Animation'}
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
