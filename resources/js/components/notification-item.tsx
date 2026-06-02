import type { Notification, SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';

interface NotificationItemProps {
    notification: Notification;
    onClose?: () => void;
}

export default function NotificationItem({ notification, onClose }: NotificationItemProps) {
    const { auth } = usePage<SharedData>().props;
    const isUnread = !notification.read_at;
    const isAdmin = auth.user?.role === 'admin';
    const routePrefix = isAdmin ? '/admin/notifications' : '/notifications';

    const handleClick = () => {
        // Mark as read if unread
        if (isUnread) {
            router.post(
                `${routePrefix}/${notification.id}/read`,
                {},
                {
                    preserveScroll: true,
                    preserveState: true,
                    only: ['notifications'],
                },
            );
        }

        // Navigate to action URL if exists, then close dropdown
        if (notification.data.action_url) {
            router.visit(notification.data.action_url);
            onClose?.();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (confirm('Hapus notifikasi ini?')) {
            router.delete(`${routePrefix}/${notification.id}`, {
                preserveScroll: true,
                preserveState: true,
                only: ['notifications'],
            });
        }
    };

    return (
        <div
            role="button"
            tabIndex={0}
            className={`group relative w-full cursor-pointer border-b border-border p-4 transition-all last:border-b-0 ${
                isUnread ? 'bg-primary/5' : 'bg-white hover:bg-gray-50'
            }`}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            aria-label={notification.data.title}
        >
            {/* Unread indicator */}
            {isUnread && <div className="absolute top-1/2 left-2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary" />}

            <div className={`${isUnread ? 'pl-4' : ''}`}>
                {/* Title */}
                <h4 className={`mb-1 text-sm ${isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                    {notification.data.title}
                </h4>

                {/* Message */}
                <p className="mb-2 line-clamp-2 text-xs text-gray-600">{notification.data.message}</p>

                {/* Footer: Time & Actions */}
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{notification.created_at}</span>

                    {/* Delete button */}
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="rounded-lg p-1.5 text-gray-400 transition-all hover:bg-red-50 hover:text-red-600"
                        title="Hapus notifikasi"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
