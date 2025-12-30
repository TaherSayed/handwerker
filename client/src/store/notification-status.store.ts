import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotificationStatusState {
    hasUnread: boolean;
    lastChecked: string | null;
    setHasUnread: (unread: boolean) => void;
    markAsRead: () => void;
}

export const useNotificationStatusStore = create<NotificationStatusState>()(
    persist(
        (set) => ({
            hasUnread: true, // Default to true to show the red dot initially
            lastChecked: null,
            setHasUnread: (unread) => set({ hasUnread: unread }),
            markAsRead: () => set({ hasUnread: false, lastChecked: new Date().toISOString() }),
        }),
        {
            name: 'onsite-notification-status',
        }
    )
);
