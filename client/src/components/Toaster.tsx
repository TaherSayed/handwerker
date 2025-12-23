import { useNotificationStore, NotificationType } from '../store/notificationStore';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const icons: Record<NotificationType, any> = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
};

const styles: Record<NotificationType, string> = {
    success: 'bg-green-50 border-green-200 text-green-800 shadow-green-200/50',
    error: 'bg-red-50 border-red-200 text-red-800 shadow-red-200/50',
    warning: 'bg-amber-50 border-amber-200 text-amber-800 shadow-amber-200/50',
    info: 'bg-indigo-50 border-indigo-200 text-indigo-800 shadow-indigo-200/50',
};

const iconColors: Record<NotificationType, string> = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-amber-500',
    info: 'text-indigo-500',
};

export default function Toaster() {
    const { notifications, remove } = useNotificationStore();

    return (
        <div className="fixed bottom-24 lg:bottom-12 right-4 lg:right-12 z-[1000] flex flex-col gap-4 max-w-md w-full pointer-events-none">
            {notifications.map((n) => {
                const Icon = icons[n.type];
                return (
                    <div
                        key={n.id}
                        className={`pointer-events-auto group animate-slide-up flex items-start gap-4 p-5 rounded-3xl border-2 shadow-2xl transition-all ${styles[n.type]}`}
                    >
                        <div className={`w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${iconColors[n.type]}`}>
                            <Icon className="w-6 h-6" />
                        </div>

                        <div className="flex-1 pt-1">
                            <h4 className="font-black text-xs uppercase tracking-widest">{n.message}</h4>
                            {n.description && (
                                <p className="text-[10px] font-bold mt-1 uppercase tracking-tighter opacity-70 leading-relaxed">
                                    {n.description}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={() => remove(n.id)}
                            className="p-1 hover:bg-black/5 rounded-lg transition-colors shrink-0"
                        >
                            <X className="w-4 h-4 opacity-40 hover:opacity-100" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
