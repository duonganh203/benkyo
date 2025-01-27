import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from './hooks/useAuthStore';

const ProtectedRoute = () => {
    const user = useAuthStore((state) => state.user);
    return user ? <Outlet /> : <Navigate to='/login' />;
};

export default ProtectedRoute;
