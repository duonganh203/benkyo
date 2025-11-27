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
import CardDetails from './pages/card-details';
import Profile from './pages/profile';
import ProgressPage from './pages/progress';
import Quizzes from './pages/quizzes';
import Quiz from './pages/do-quiz';
import QuizResults from './pages/quiz-attempt-detail';
import AIChat from './pages/ai-chat';
import Payment from './pages/payment';
import Packages from './pages/package';
import Community from './pages/community';
import ClassManagement from './pages/class-management';
import Notifications from './pages/notification';
import { InviteDialog } from './components/invite-dialog';
import ClassDetailUser from './pages/class-detail-user';
import TopLearners from './pages/top-study-streak';
import ClassUpdate from './pages/class-update';
import ClassJoin from './pages/class-join';
import ClassCreate from './pages/class-create';
import ClassList from './pages/class-list';
import { ForgotPasswordForm } from './components/forms/forgot-password-form';
import { ResetPasswordForm } from './components/forms/reset-password-form';
import MOOCDetail from './pages/mooc-detail';
import DeckStudy from './pages/class-deck-study';
import { ClassUpdateMooc } from './pages/update-mooc';
import Requests from './pages/requests';
import QuizHub from './pages/quiz-hub-class';
import QuizTakingPage from './pages/do-quiz-class';
import WalletTopup from './pages/wallet-topup';

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
                            <Route path='/forgotPassword' element={<ForgotPasswordForm />} />
                            <Route path='/resetPassword' element={<ResetPasswordForm />} />
                        </Route>
                        <Route element={<GlobalLayout />}>
                            <Route path='/' element={<Marketing />} />
                        </Route>
                        <Route element={<ProtectedRoute />}>
                            <Route path='/home' element={<ProgressPage />} />
                            <Route path='/deck/:id' element={<DeckDetail />} />
                            <Route path='/deck/:deckId/create-card' element={<CreateCard />} />
                            <Route path='/deck/:deckId/edit-card/:cardId' element={<UpdateCard />} />
                            <Route path='/flashcards/:id/details' element={<CardDetails />} />
                            <Route path='/profile' element={<Profile />} />
                            <Route path='/my-decks' element={<Library />} />
                            <Route path='/my-decks/requests' element={<Requests />} />
                            <Route path='/study/:id' element={<StudyCard />} />
                            <Route path='do-quiz/:quizId' element={<Quiz />} />
                            <Route path='quiz/attempt/:quizAttemptId' element={<QuizResults />} />
                            <Route path='/quizzes' element={<Quizzes />} />
                            <Route path='/ai-chat' element={<AIChat />} />
                            <Route path='/payment/:packageId' element={<Payment />} />
                            <Route path='/wallet/topup' element={<WalletTopup />} />
                            <Route path='/package' element={<Packages />} />
                            <Route path='/top-learners' element={<TopLearners />} />
                            <Route path='/community' element={<Community />} />
                            <Route path='/class/update' element={<ClassUpdate />} />
                            <Route path='/class/create' element={<ClassCreate />} />
                            <Route path='/class/:classId/update' element={<ClassUpdate />} />
                            <Route path='/class/list' element={<ClassList />} />
                            <Route path='/class/:classId/management' element={<ClassManagement />} />
                            <Route path='/notification' element={<Notifications />} />
                            <Route path='/class/:classId' element={<ClassDetailUser />} />
                            <Route path='/class/:classId/request' element={<ClassJoin />} />
                            <Route path='/class/:classId/mooc/:moocId' element={<MOOCDetail />} />
                            <Route path='/class/:classId/mooc/:moocId/deck/:deckId' element={<DeckStudy />} />
                            <Route path='/class/:classId/mooc/:moocId/deck/:deckId/quiz-hub' element={<QuizHub />} />
                            <Route
                                path='/class/:classId/mooc/:moocId/deck/:deckId/quiz-hub/:quizId'
                                element={<QuizTakingPage />}
                            />
                            <Route path='/moocs/update/:moocId' element={<ClassUpdateMooc />} />
                        </Route>
                    </Routes>
                    <ModalProvider />
                    <InviteDialog />
                </Router>
                <Toaster closeButton richColors position='top-right' />
            </ThemeProvider>
        </QueryClientProvider>
    );
};

export default App;
