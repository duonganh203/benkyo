import { Outlet } from 'react-router-dom';

const GlobalLayout = () => {
    return (
        <div className=''>
            <Outlet />
        </div>
    );
};
export default GlobalLayout;
