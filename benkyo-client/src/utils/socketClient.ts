import { useNotificationStore } from '@/hooks/stores/use-notification-store';
import { useInviteDialogStore } from '@/hooks/stores/use-invite-dialog-store';
import { acceptInviteClassApi, rejectInviteClassApi } from '@/api/classApi';

let socket: WebSocket | null = null;

export const connectWebSocket = (email: string) => {
    const url = import.meta.env.VITE_WS_URL || 'ws://localhost:5000/ws';

    if (!email) return;
    if (socket && socket.readyState !== WebSocket.CLOSED) return;

    socket = new WebSocket(url);

    socket.onopen = () => {
        socket?.send(JSON.stringify({ type: 'register', email }));
    };

    socket.onmessage = (event) => {
        createMessageHandler()(event);
    };

    socket.onclose = () => {
        socket = null;
    };

    socket.onerror = () => {
        socket = null;
    };
};

function createMessageHandler() {
    return async (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        if (data.type === 'invite') {
            const { classId, className, description } = data.payload;
            useNotificationStore.getState().addNotification({
                id: classId,
                message: `You were invited to class: ${className}`,
                description,
                type: 'invite',
                createdAt: new Date().toISOString()
            });

            useInviteDialogStore.getState().open(
                className,
                description,
                async () => {
                    try {
                        await acceptInviteClassApi(classId);
                        useNotificationStore.getState().removeNotification(classId);
                    } catch (err) {
                        console.error('Accept failed:', err);
                    }
                },
                async () => {
                    try {
                        await rejectInviteClassApi(classId);
                        useNotificationStore.getState().removeNotification(classId);
                    } catch (err) {
                        console.error('Reject failed:', err);
                    }
                }
            );
        }
    };
}
