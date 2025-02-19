import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AxiosError } from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from './pages/home';
import { RegisterForm } from './components/forms/register-form';
import { LoginForm } from './components/forms/login-form';
import LoginPassport from './components/login-passport';
import Marketing from './pages/marketing';
import ProtectedRoute from './components/layouts/protected-route';
import AuthRoute from './components/layouts/auth-route';
import GlobalLayout from './components/layouts/global-layout';
import './index.css';
import { ThemeProvider } from './components/providers/theme-provider';
import DeckDetail from './pages/deck-detail';
import ModalProvider from './components/providers/modal-provider';
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
                            <Route path='/passport' element={<LoginPassport />} />
                        </Route>
                        <Route element={<GlobalLayout />}>
                            <Route path='/' element={<Marketing />} />
                            <Route element={<ProtectedRoute />}>
                                <Route path='/home' element={<Home />} />
                                <Route path='/deck/:id' element={<DeckDetail />} />
                            </Route>
                        </Route>
                    </Routes>
                    <ModalProvider />
                </Router>
            </ThemeProvider>
        </QueryClientProvider>
    );
};

export default App;
