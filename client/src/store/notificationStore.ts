import { create } from 'zustand';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    description?: string;
    duration?: number;
}

interface NotificationState {
    notifications: Notification[];
    notify: (notification: Omit<Notification, 'id'>) => void;
    remove: (id: string) => void;
    success: (message: string, description?: string) => void;
    error: (message: string, description?: string) => void;
    info: (message: string, description?: string) => void;
    warn: (message: string, description?: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],

    notify: (notification) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newNotification = { ...notification, id };

        set((state) => ({
            notifications: [...state.notifications, newNotification],
        }));

        if (notification.duration !== 0) {
            setTimeout(() => {
                set((state) => ({
                    notifications: state.notifications.filter((n) => n.id !== id),
                }));
            }, notification.duration || 5000);
        }
    },

    remove: (id) => {
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
        }));
    },

    success: (message, description) => {
        const { notify } = useNotificationStore.getState();
        notify({ type: 'success', message, description });
    },

    error: (message, description) => {
        const { notify } = useNotificationStore.getState();
        notify({ type: 'error', message, description });
    },

    info: (message, description) => {
        const { notify } = useNotificationStore.getState();
        notify({ type: 'info', message, description });
    },

    warn: (message, description) => {
        const { notify } = useNotificationStore.getState();
        notify({ type: 'warning', message, description });
    },
}));
