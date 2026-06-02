import type { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { useState } from 'react';
import NotificationDropdown from './notification-dropdown';

interface NotificationBellProps {
    variant?: 'primary' | 'light';
}

export default function NotificationBell({ variant = 'primary' }: NotificationBellProps) {
    const { notifications } = usePage<SharedData>().props;
    const [isOpen, setIsOpen] = useState(false);

    const notificationList = notifications?.data || [];
    const unreadCount = notifications?.unread_count || 0;

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const isPrimary = variant === 'primary';
    const buttonStyles = isPrimary ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900';

    return (
        <div className="relative">
            {/* Bell Icon Button */}
            <button
                type="button"
                onClick={handleToggle}
                className={`relative rounded-lg p-2 transition-colors ${buttonStyles}`}
                aria-label="Notifikasi"
            >
                <Bell className="h-5 w-5" />

                {/* Badge for Unread Count */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && <NotificationDropdown notifications={notificationList} unreadCount={unreadCount} onClose={() => setIsOpen(false)} />}
        </div>
    );
}
