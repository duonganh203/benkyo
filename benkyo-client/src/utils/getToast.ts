import { toast } from 'sonner';

type ToastState = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'dismiss';

export const getToast = (state: ToastState, value?: string, description?: string) => {
    const msgDescription = description ?? new Date().toLocaleString();
    switch (state) {
        case 'success':
            toast.success(value, { description: msgDescription });
            break;
        case 'error':
            toast.error(value, { description: msgDescription });
            break;
        case 'warning':
            toast.warning(value, { description: msgDescription });
            break;
        case 'loading':
            toast.loading(value, { description: msgDescription });
            break;
        case 'info':
            toast.info(value, { description: msgDescription });
            break;
        case 'dismiss':
            toast.dismiss();
            break;
        default:
            toast(value, { description: msgDescription });
            break;
    }
};
