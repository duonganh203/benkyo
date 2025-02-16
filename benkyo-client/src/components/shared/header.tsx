import useAuthStore from '@/hooks/use-auth-store';
import { Button } from '../ui/button';
import { PlusCircle } from 'lucide-react';
import { ModeToggle } from '../mode-toggle';
import { Link } from 'react-router-dom';

const Header = () => {
    const user = useAuthStore((state) => state.user);
    return (
        <header className='fixed w-full py-2 border-b'>
            <div className='max-w-[1416px] mx-auto flex justify-between items-center'>
                <Link to='#' className='flex items-center gap-2'>
                    <img src='/images/logo.png' className='size-5' />
                    <h3 className='font-bold'>BENKYO</h3>
                </Link>
                <div className='flex items-center space-x-4'>
                    <ModeToggle />
                    {!user ? (
                        <Button variant='outline' asChild>
                            <Link to='/login'>Sign In</Link>
                        </Button>
                    ) : (
                        <div>
                            <Button>
                                <PlusCircle />
                                Create deck
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
export default Header;
