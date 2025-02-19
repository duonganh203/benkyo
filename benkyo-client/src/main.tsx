import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { Toaster } from 'sonner';
import ModalProvider from './components/providers/modal-provider.tsx';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
        <Toaster closeButton position='top-right' />
        <ModalProvider />
    </StrictMode>
);
