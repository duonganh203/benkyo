import { Outlet } from 'react-router-dom';
import Header from '../shared/header';

const GlobalLayout = () => {
    return (
        <>
            <Header />
            <div className='px-8'>
                <Outlet />
            </div>
        </>
    );
};
export default GlobalLayout;
