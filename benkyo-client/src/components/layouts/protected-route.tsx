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
            <main className='w-full'>
                <div className='flex justify-center items-center'>
                    <Outlet />
                </div>
            </main>
        </SidebarProvider>
    );
};

export default ProtectedRoute;
