import { Brain, Library, Trophy } from 'lucide-react';
import { Badge } from './ui/badge';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/utils';

const HowItWorkSection = () => {
    const { ref: headerRef, inView: headerInView } = useInView({ triggerOnce: true, threshold: 0.1 });
    const { ref: stepsRef, inView: stepsInView } = useInView({ triggerOnce: true, threshold: 0.1 });

    const steps = [
        {
            icon: Library,
            number: 1,
            title: 'Create Collections',
            description: 'Build your own flashcard collections organized by subject, topic, or course'
        },
        {
            icon: Brain,
            number: 2,
            title: 'Study & Review',
            description: 'Review flashcards with our intuitive interface that adapts to your learning style'
        },
        {
            icon: Trophy,
            number: 3,
            title: 'Track Progress',
            description: 'Visualize your learning progress and identify areas for improvement'
        }
    ];

    return (
        <section className='py-20 px-6 bg-background dark:bg-background'>
            <div className='max-w-6xl mx-auto'>
                <div
                    ref={headerRef}
                    className={cn(
                        'text-center mb-16 transition-all duration-700',
                        headerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    )}
                >
                    <Badge variant='outline' className='mb-4 border-blue-200 dark:border-blue-800/40'>
                        Simple Process
                    </Badge>
                    <h2 className='text-3xl md:text-4xl font-bold tracking-tight text-foreground dark:text-foreground'>
                        How Benkyo Works
                    </h2>
                    <p className='mt-4 text-muted-foreground dark:text-muted-foreground max-w-2xl mx-auto'>
                        Our streamlined approach makes learning efficient and effective
                    </p>
                </div>

                <div ref={stepsRef} className='grid md:grid-cols-3 gap-8 md:gap-12'>
                    {steps.map((step, index) => (
                        <div
                            key={step.title}
                            className={cn(
                                'flex flex-col items-center text-center transition-all duration-700',
                                stepsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
                                index === 0 ? 'delay-100' : index === 1 ? 'delay-300' : 'delay-500'
                            )}
                        >
                            <div className='h-16 w-16 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4 relative'>
                                <step.icon className='h-8 w-8 text-blue-600 dark:text-blue-400' />
                                <span className='absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 dark:bg-blue-500 text-xs text-white'>
                                    {step.number}
                                </span>
                            </div>
                            <h3 className='text-xl font-medium mb-2 text-foreground dark:text-foreground'>
                                {step.title}
                            </h3>
                            <p className='text-muted-foreground dark:text-muted-foreground'>{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorkSection;
