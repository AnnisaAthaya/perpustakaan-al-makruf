import type { Notification, SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import NotificationItem from './notification-item';

interface NotificationDropdownProps {
    notifications: Notification[];
    unreadCount: number;
    onClose: () => void;
}

export default function NotificationDropdown({ notifications, unreadCount, onClose }: NotificationDropdownProps) {
    const { auth } = usePage<SharedData>().props;
    const dropdownRef = useRef<HTMLDivElement>(null);
    const isAdmin = auth.user?.role === 'admin';
    const routePrefix = isAdmin ? '/admin/notifications' : '/notifications';

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                // Only close on desktop, mobile has overlay
                if (window.innerWidth >= 640) {
                    onClose();
                }
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    // Close dropdown on ESC key press
    useEffect(() => {
        function handleEscKey(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                onClose();
            }
        }

        document.addEventListener('keydown', handleEscKey);
        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [onClose]);

    const handleMarkAllAsRead = () => {
        router.post(
            `${routePrefix}/read-all`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                only: ['notifications'],
            },
        );
    };

    return (
        <>
            {/* Mobile: Fixed overlay for better UX */}
            <div className="fixed inset-0 z-40 bg-black/20 sm:hidden" onClick={onClose} />

            {/* Dropdown */}
            <div
                ref={dropdownRef}
                className="fixed top-16 right-4 z-50 w-[calc(100vw-2rem)] max-w-md overflow-hidden rounded-xl border border-border bg-white shadow-lg sm:absolute sm:top-12 sm:right-0 sm:w-96"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border bg-gray-50 px-4 py-3">
                    <h3 className="text-sm font-semibold text-gray-900">Notifikasi</h3>
                    {unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={handleMarkAllAsRead}
                            className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
                        >
                            <span className="hidden sm:inline">Tandai semua dibaca</span>
                            <span className="sm:hidden">Tandai dibaca</span>
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                <div className="max-h-96 overflow-y-auto sm:max-h-96">
                    {notifications.length === 0 ? (
                        <div className="flex h-32 items-center justify-center">
                            <p className="text-sm text-gray-500">Belum ada notifikasi</p>
                        </div>
                    ) : (
                        notifications.map((notification) => <NotificationItem key={notification.id} notification={notification} onClose={onClose} />)
                    )}
                </div>
            </div>
        </>
    );
}
