import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/utils';

const testimonials = [
    {
        initials: 'JD',
        name: 'Jane Doe',
        role: 'Medical Student',
        text: '"Benkyo has completely transformed how I study for my medical exams. The interface is beautiful and the spaced repetition really works!"'
    },
    {
        initials: 'JS',
        name: 'John Smith',
        role: 'Computer Science Major',
        text: '"The quiz feature helps me test my knowledge before exams. I\'ve seen my grades improve dramatically since using Benkyo."'
    },
    {
        initials: 'AL',
        name: 'Amy Lee',
        role: 'Language Learner',
        text: '"Learning Japanese vocabulary became so much easier with Benkyo. The clean design keeps me focused on what matters."'
    }
];

const TestimonialSection = () => {
    const { ref: headerRef, inView: headerInView } = useInView({ triggerOnce: true, threshold: 0.1 });
    const { ref: cardsRef, inView: cardsInView } = useInView({ triggerOnce: true, threshold: 0.1 });

    return (
        <section className='py-20 px-6 bg-blue-50/50 dark:bg-blue-950/10'>
            <div className='max-w-6xl mx-auto'>
                <div
                    ref={headerRef}
                    className={cn(
                        'text-center mb-16 transition-all duration-700',
                        headerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    )}
                >
                    <Badge variant='outline' className='mb-4 border-blue-200 dark:border-blue-800/40'>
                        Testimonials
                    </Badge>
                    <h2 className='text-3xl md:text-4xl font-bold text-foreground dark:text-foreground'>
                        What Our Users Say
                    </h2>
                    <p className='mt-4 text-muted-foreground dark:text-muted-foreground max-w-2xl mx-auto'>
                        Join thousands of students who have transformed their learning experience
                    </p>
                </div>

                <div ref={cardsRef} className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
                    {testimonials.map((testimonial, index) => (
                        <Card
                            key={testimonial.name}
                            className={cn(
                                'backdrop-blur-sm bg-white/90 dark:bg-background/10 border border-blue-100 dark:border-blue-900/20 shadow-sm dark:shadow-black/10 transition-all duration-700',
                                cardsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
                                index === 0 ? 'delay-100' : index === 1 ? 'delay-300' : 'delay-500'
                            )}
                        >
                            <CardContent className='pt-6'>
                                <div className='flex items-center mb-4'>
                                    <div className='w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold'>
                                        {testimonial.initials}
                                    </div>
                                    <div className='ml-4'>
                                        <h4 className='font-medium text-foreground dark:text-foreground'>
                                            {testimonial.name}
                                        </h4>
                                        <p className='text-sm text-muted-foreground dark:text-muted-foreground'>
                                            {testimonial.role}
                                        </p>
                                    </div>
                                </div>
                                <p className='text-muted-foreground dark:text-muted-foreground'>{testimonial.text}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialSection;
