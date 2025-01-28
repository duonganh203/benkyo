import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProtectedRoute from './protectedRoute';
import Home from './pages/home';
import { AxiosError } from 'axios';
import UnProtectedRoute from './unprotectedRoute';
import { RegisterForm } from './components/register-form';
import { LoginForm } from './components/login-form';
import Marketing from './pages/marketing';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error) => {
                const axiosError = error as AxiosError;
                return axiosError.response?.status !== 401 && failureCount < 3;
            }
        }
    }
});

const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <Routes>
                    <Route element={<UnProtectedRoute />}>
                        <Route path='/' element={<Marketing />} />
                        <Route path='/login' element={<LoginForm />} />
                        <Route path='/register' element={<RegisterForm />} />
                    </Route>
                    <Route element={<ProtectedRoute />}>
                        <Route path='/home' element={<Home />} />
                    </Route>
                </Routes>
            </Router>
        </QueryClientProvider>
    );
};

export default App;
