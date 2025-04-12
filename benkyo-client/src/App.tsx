import './index.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AxiosError } from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RegisterForm } from './components/forms/register-form';
import { LoginForm } from './components/forms/login-form';
import LoginPassport from './components/login-passport';
import Marketing from './pages/marketing';
import ProtectedRoute from './components/layouts/protected-route';
import AuthRoute from './components/layouts/auth-route';
import GlobalLayout from './components/layouts/global-layout';
import { ThemeProvider } from './components/providers/theme-provider';
import DeckDetail from './pages/deck-detail';
import ModalProvider from './components/providers/modal-provider';
import { Toaster } from './components/ui/sonner';
import CreateCard from './pages/create-card';
import StudyCard from './pages/study-card';
import Library from './pages/library';
import UpdateCard from './pages/update-card';
import Profile from './pages/profile';
import ProgressPage from './pages/progress';
import Quizzes from './pages/quizzes';
import Quiz from './pages/do-quiz';
import QuizResults from './pages/quiz-attempt-detail';
import AIChat from './pages/ai-chat';
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
                                <Route path='/home' element={<ProgressPage />} />
                                <Route path='/deck/:id' element={<DeckDetail />} />
                                <Route path='/deck/:deckId/create-card' element={<CreateCard />} />
                                <Route path='/deck/:deckId/edit-card/:cardId' element={<UpdateCard />} />
                                <Route path='/profile' element={<Profile />} />
                                <Route path='/my-decks' element={<Library />} />
                                <Route path='/study/:id' element={<StudyCard />} />
                                <Route path='do-quiz/:quizId' element={<Quiz />} />
                                <Route path='quiz/attempt/:quizAttemptId' element={<QuizResults />} />
                                <Route path='/quizzes' element={<Quizzes />} />
                                <Route path='/ai-chat' element={<AIChat />} />
                            </Route>
                        </Route>
                    </Routes>
                    <ModalProvider />
                </Router>
                <Toaster closeButton richColors position='top-right' />
            </ThemeProvider>
        </QueryClientProvider>
    );
};

export default App;
