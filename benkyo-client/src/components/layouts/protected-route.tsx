import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '@/hooks/stores/use-auth-store';
import { SidebarProvider } from '../ui/sidebar';
import { AppSidebar } from '../app-sidebar';

const ProtectedRoute = () => {
    const user = useAuthStore((state) => state.user);
    if (!user) return <Navigate to='/login' />;
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className='flex-1 bg-primary/2'>
                <Outlet />
            </main>
        </SidebarProvider>
    );
};

export default ProtectedRoute;
