import useAuthStore from '@/hooks/stores/use-auth-store';
import { Navigate, Outlet } from 'react-router-dom';

const AuthRoute = () => {
    const user = useAuthStore((state) => state.user);
    return !user ? <Outlet /> : <Navigate to='/home' />;
};

export default AuthRoute;
