import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from './hooks/useAuthStore';

const UnProtectedRoute = () => {
    const user = useAuthStore((state) => state.user);
    return !user ? <Outlet /> : <Navigate to='/home' />;
};

export default UnProtectedRoute;
