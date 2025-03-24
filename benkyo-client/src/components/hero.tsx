import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
    return (
        <section className='py-20 md:py-28 px-6'>
            <div className='max-w-5xl mx-auto text-center'>
                <div className='inline-block opacity-0 animate-fade-up'>
                    <span className='px-3 py-1 text-sm font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'>
                        Elegant Learning Experience
                    </span>
                </div>

                <h1 className='mt-6 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight opacity-0 animate-fade-up animation-delay-200 text-foreground dark:text-foreground'>
                    Memorize with clarity and <span className='text-blue-600 dark:text-blue-400'>precision</span>
                </h1>

                <p className='mt-6 text-lg text-muted-foreground dark:text-muted-foreground max-w-2xl mx-auto opacity-0 animate-fade-up animation-delay-300'>
                    Effortlessly create, manage, and study flashcards with an immersive design focused on what matters
                    most: your learning journey.
                </p>

                <div className='mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-up animation-delay-400'>
                    <Link to='/home' className='w-full sm:w-auto'>
                        <Button
                            size='lg'
                            className='w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white'
                        >
                            Get Started
                            <ArrowRight className='ml-2 h-4 w-4' />
                        </Button>
                    </Link>

                    <Link to='/my-decks' className='w-full sm:w-auto'>
                        <Button
                            size='lg'
                            variant='outline'
                            className='w-full sm:w-auto border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 dark:border-blue-800/30 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300'
                        >
                            Create Collection
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
