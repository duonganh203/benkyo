import { Outlet } from 'react-router-dom';

const GlobalLayout = () => {
    return (
        <div className='px-8'>
            <Outlet />
        </div>
    );
};
export default GlobalLayout;
