import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className='mt-10 py-6 px-6 border-t border-border dark:border-border bg-background dark:bg-background'>
            <div className='max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4'>
                <div className='flex items-center gap-2'>
                    <img src='/images/logo.png' className='size-5' />
                    <span className='font-medium text-foreground dark:text-foreground'>Benkyo</span>
                </div>

                <div className='flex items-center space-x-6'>
                    <Link
                        to='/flashcards'
                        className='text-sm text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
                    >
                        Collections
                    </Link>
                    <Link
                        to='/dashboard'
                        className='text-sm text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
                    >
                        Dashboard
                    </Link>
                    <a
                        href='#'
                        className='text-sm text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
                    >
                        Help
                    </a>
                    <a
                        href='#'
                        className='text-sm text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
                    >
                        Privacy
                    </a>
                </div>

                <p className='text-sm text-muted-foreground dark:text-muted-foreground'>
                    Designed with <span className='text-blue-600 dark:text-blue-400'>precision</span>. Built for focus.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
