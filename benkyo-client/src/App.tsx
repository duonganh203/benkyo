import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from './pages/home';
import { AxiosError } from 'axios';
import { RegisterForm } from './components/register-form';
import { LoginForm } from './components/login-form';
import Marketing from './pages/marketing';
import ProtectedRoute from './components/layouts/protectedRoute';
import AuthRoute from './components/layouts/authRoute';
import GlobalLayout from './components/layouts/globalLayout';

import './index.css';
import { ThemeProvider } from './components/themeProvider';
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
            <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
                <Router>
                    <Routes>
                        <Route element={<AuthRoute />}>
                            <Route path='/login' element={<LoginForm />} />
                            <Route path='/register' element={<RegisterForm />} />
                        </Route>
                        <Route element={<GlobalLayout />}>
                            <Route path='/' element={<Marketing />} />
                            <Route element={<ProtectedRoute />}>
                                <Route path='/home' element={<Home />} />
                            </Route>
                        </Route>
                    </Routes>
                </Router>
            </ThemeProvider>
        </QueryClientProvider>
    );
};

export default App;
