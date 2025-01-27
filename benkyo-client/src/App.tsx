import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './protectedRoute';
import Home from './pages/home';
import { AxiosError } from 'axios';

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
                    {/* <Route path='/login' element={<Login />} /> */}
                    {/* <Route path='/register' element={<Register />} /> */}
                    <Route
                        path='/'
                        element={
                            <ProtectedRoute>
                                <Home />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Router>
        </QueryClientProvider>
    );
};

export default App;
