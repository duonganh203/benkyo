import { BarChart3, BookOpen, Library } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/utils';

const FeaturesSection = () => {
    const { ref: titleRef, inView: titleInView } = useInView({ triggerOnce: true, threshold: 0.1 });
    const { ref: cardsRef, inView: cardsInView } = useInView({ triggerOnce: true, threshold: 0.1 });

    const features = [
        {
            icon: Library,
            title: 'Smart Collections',
            description: 'Organize your flashcards into collections for efficient topic-based studying.'
        },
        {
            icon: BookOpen,
            title: 'Intuitive Study Mode',
            description: 'Focus on your flashcards with a clean, distraction-free interface and smooth animations.'
        },
        {
            icon: BarChart3,
            title: 'Progress Tracking',
            description: 'Track your study progress and focus on the cards you find most challenging.'
        }
    ];

    return (
        <section className='py-16 px-6 bg-slate-50 dark:bg-slate-950/30'>
            <div className='max-w-6xl mx-auto'>
                <div ref={titleRef}>
                    <h2
                        className={cn(
                            'text-center text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 transition-all duration-700',
                            titleInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        )}
                    >
                        Designed for focused learning
                    </h2>
                </div>

                <div ref={cardsRef} className='mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
                    {features.map((feature, index) => (
                        <div
                            key={feature.title}
                            className={cn(
                                'bg-background/40 backdrop-blur-sm rounded-lg p-6 shadow-sm dark:shadow-black/10 transition-all duration-500 hover:shadow-md dark:hover:shadow-black/20',
                                cardsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
                                index === 0 ? 'delay-100' : index === 1 ? 'delay-200' : 'delay-300'
                            )}
                        >
                            <div className='h-12 w-12 flex items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4'>
                                <feature.icon className='h-6 w-6' />
                            </div>
                            <h3 className='text-xl font-medium text-slate-800 dark:text-slate-100'>{feature.title}</h3>
                            <p className='mt-2 text-slate-600 dark:text-slate-400'>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
