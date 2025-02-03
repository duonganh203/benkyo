import useAuthStore from '@/hooks/useAuthStore';
import { Navigate, Outlet } from 'react-router-dom';

const AuthRoute = () => {
    const user = useAuthStore((state) => state.user);
    return !user ? <Outlet /> : <Navigate to='/home' />;
};

export default AuthRoute;
