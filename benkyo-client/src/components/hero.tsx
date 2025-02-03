import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowRightFromLineIcon } from 'lucide-react';

const HeroSection = () => {
    return (
        <section className='text-center pt-36 md:pt-48 pb-10'>
            <div className='space-y-6 text-center'>
                <div className='space-y-2 mx-auto'>
                    <h1 className='text-5xl font-bold md:text-6xl lg:text-7xl gradient-title'>
                        Unlock Your Learning Potential with Benkyo <br />
                        The Intelligent Flashcard App
                    </h1>
                    <p className='mx-auto max-w-[650px] text-muted-foreground md:text-xl'>
                        Supercharge your learning with Benkyo. AI-driven flashcards personalize your study experience
                        for maximum retention and success.
                    </p>
                </div>
                <div>
                    <Button size='lg' className='px-8' asChild>
                        <Link to='/home'>
                            Get Started <ArrowRightFromLineIcon />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
