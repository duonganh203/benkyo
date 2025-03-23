import { useState } from 'react';
import { BarChart3, BookOpen, CheckCircle2, LightbulbIcon } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';

const StudyMethodSection = () => {
    const [activeTab, setActiveTab] = useState('flashcards');
    const { ref: headerRef, inView: headerInView } = useInView({ triggerOnce: true, threshold: 0.1 });
    const { ref: contentRef, inView: contentInView } = useInView({ triggerOnce: true, threshold: 0.1 });

    const features = [
        {
            id: 'flashcards',
            title: 'Interactive Flashcards',
            description:
                'Traditional yet effective, our flashcards feature smooth animations and a clean interface to help you focus on the content.',
            icon: BookOpen,
            items: ['Customizable card content', 'Beautiful animations', 'Self-assessment options']
        },
        {
            id: 'quizzes',
            title: 'Knowledge Testing',
            description: 'Challenge yourself with interactive quizzes generated from your flashcard collections.',
            icon: LightbulbIcon,
            items: ['Multiple-choice questions', 'Immediate feedback', 'Performance tracking']
        },
        {
            id: 'stats',
            title: 'Progress Analytics',
            description: 'Visualize your learning journey with detailed analytics and insights.',
            icon: BarChart3,
            items: ['Study time tracking', 'Performance metrics', 'Improvement suggestions']
        }
    ];

    return (
        <section className='py-20 px-6 bg-background dark:bg-background/95'>
            <div className='max-w-6xl mx-auto'>
                <div
                    ref={headerRef}
                    className={cn(
                        'text-center mb-12 transition-all duration-700',
                        headerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    )}
                >
                    <Badge
                        variant='outline'
                        className='mb-4 bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800/40 dark:text-blue-400'
                    >
                        Study Your Way
                    </Badge>
                    <h2 className='text-3xl md:text-4xl font-bold text-foreground dark:text-foreground'>
                        Multiple Learning Methods
                    </h2>
                    <p className='mt-4 text-muted-foreground dark:text-muted-foreground max-w-2xl mx-auto'>
                        Choose the approach that works best for your learning style
                    </p>
                </div>

                <Tabs
                    defaultValue='flashcards'
                    className='w-full max-w-4xl mx-auto'
                    value={activeTab}
                    onValueChange={setActiveTab}
                >
                    <div
                        className={cn(
                            'transition-all duration-500',
                            headerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        )}
                    >
                        <TabsList className='grid grid-cols-3 w-full mb-8'>
                            {features.map((feature) => (
                                <TabsTrigger
                                    key={feature.id}
                                    value={feature.id}
                                    className='data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-400'
                                >
                                    {feature.id.charAt(0).toUpperCase() + feature.id.slice(1)}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    <div ref={contentRef}>
                        {features.map((feature) => (
                            <TabsContent
                                key={feature.id}
                                value={feature.id}
                                className={cn(
                                    'p-6 bg-background/50 dark:bg-secondary-foreground/5 border border-blue-100 dark:border-blue-900/20 rounded-lg shadow-sm dark:shadow-black/5 transition-all duration-700',
                                    activeTab === feature.id && contentInView
                                        ? 'opacity-100 translate-y-0'
                                        : 'opacity-0 translate-y-4'
                                )}
                            >
                                <div className='flex flex-col md:flex-row items-center gap-8'>
                                    <div className='w-full md:w-1/2 aspect-video bg-gradient-to-br from-blue-100 to-blue-200/80 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg flex items-center justify-center'>
                                        <feature.icon className='h-16 w-16 text-blue-600/80 dark:text-blue-400/80' />
                                    </div>
                                    <div className='w-full md:w-1/2'>
                                        <h3 className='text-2xl font-medium mb-4 text-foreground dark:text-foreground'>
                                            {feature.title}
                                        </h3>
                                        <p className='text-muted-foreground dark:text-muted-foreground mb-4'>
                                            {feature.description}
                                        </p>
                                        <ul className='space-y-2'>
                                            {feature.items.map((item, index) => (
                                                <li
                                                    key={index}
                                                    className={cn(
                                                        'flex items-center text-sm transition-all',
                                                        activeTab === feature.id && contentInView
                                                            ? 'opacity-100 translate-x-0'
                                                            : 'opacity-0 translate-x-4',
                                                        index === 0
                                                            ? 'delay-300'
                                                            : index === 1
                                                              ? 'delay-400'
                                                              : 'delay-500'
                                                    )}
                                                >
                                                    <CheckCircle2 className='h-4 w-4 text-blue-600 dark:text-blue-400 mr-2' />
                                                    <span className='text-foreground dark:text-foreground/90'>
                                                        {item}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </TabsContent>
                        ))}
                    </div>
                </Tabs>
            </div>
        </section>
    );
};

export default StudyMethodSection;
