import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/utils';

const CTASection = () => {
    const { ref: sectionRef, inView: sectionInView } = useInView({ triggerOnce: true, threshold: 0.1 });

    return (
        <section className='py-20 px-6 bg-gradient-to-r from-blue-100/70 to-blue-200/50 dark:from-blue-900/10 dark:to-blue-800/20'>
            <div
                ref={sectionRef}
                className={cn(
                    'max-w-5xl mx-auto text-center transition-all duration-700',
                    sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                )}
            >
                <h2 className='text-3xl md:text-4xl font-bold mb-6 text-foreground dark:text-foreground'>
                    Ready to enhance your learning?
                </h2>
                <p className='text-lg text-muted-foreground dark:text-muted-foreground mb-8 max-w-2xl mx-auto'>
                    Join thousands of students who have already transformed their study habits with Benkyo.
                </p>
                <div
                    className={cn(
                        'flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700',
                        sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
                        'delay-200'
                    )}
                >
                    <Link to='/my-decks' className='w-full sm:w-auto'>
                        <Button
                            size='lg'
                            className='w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white'
                        >
                            Start Learning Now
                            <ArrowRight className='ml-2 h-4 w-4' />
                        </Button>
                    </Link>
                    <Link to='/home' className='w-full sm:w-auto'>
                        <Button
                            size='lg'
                            variant='outline'
                            className='w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 dark:border-blue-800/30 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300'
                        >
                            View Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default CTASection;
