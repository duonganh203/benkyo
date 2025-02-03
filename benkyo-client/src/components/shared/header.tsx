import useAuthStore from '@/hooks/useAuthStore';
import { Button } from '../ui/button';
import { PlusCircle } from 'lucide-react';
import { ModeToggle } from '../modeToggle';

const Header = () => {
    const user = useAuthStore((state) => state.user);
    return (
        <header className='py-2 border-b'>
            <div className='flex justify-between items-center px-8'>
                <h3 className='font-bold'>BENKYO</h3>
                <div className='flex items-center space-x-4'>
                    {!user ? (
                        <Button variant='outline'>Get Started</Button>
                    ) : (
                        <div>
                            <Button>
                                <PlusCircle />
                                Create deck
                            </Button>
                        </div>
                    )}
                    <ModeToggle />
                </div>
            </div>
        </header>
    );
};
export default Header;
