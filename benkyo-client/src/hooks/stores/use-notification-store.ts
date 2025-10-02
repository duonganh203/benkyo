import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Notification = {
    id: string;
    message: string;
    description: string;
    type: 'invite' | 'system';
    createdAt?: string | Date;
};

type NotificationStore = {
    notifications: Notification[];
    addNotification: (notification: Notification) => void;
    setNotifications: (notifications: Notification[]) => void;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
};

export const useNotificationStore = create<NotificationStore>()(
    persist(
        (set, get) => ({
            notifications: [],
            addNotification: (notification) => {
                const exists = get().notifications.some((n) => n.id === notification.id);
                if (!exists) {
                    set({ notifications: [notification, ...get().notifications] });
                }
            },
            setNotifications: (notifications) => {
                set({ notifications });
            },
            removeNotification: (id) => {
                const updated = get().notifications.filter((n) => n.id !== id);
                set({ notifications: updated });
            },
            clearNotifications: () => set({ notifications: [] })
        }),
        {
            name: 'notification-storage',
            partialize: (state) => ({
                notifications: state.notifications
            })
        }
    )
);
