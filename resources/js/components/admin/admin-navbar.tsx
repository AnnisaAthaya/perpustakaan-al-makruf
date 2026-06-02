import NotificationBell from '@/components/notification-bell';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LogOut, Menu, Settings, User } from 'lucide-react';

interface AdminNavbarProps {
    onMenuClick: () => void;
}

export default function AdminNavbar({ onMenuClick }: AdminNavbarProps) {
    const { auth } = usePage<SharedData>().props;
    const userName = auth?.user?.name ?? 'Admin';
    const userInitials = userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <header className="shadow-soft sticky top-0 z-30 border-b border-border bg-card">
            <div className="flex h-16 items-center justify-between px-4 md:px-6">
                {/* Left side - Menu button (mobile) */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick} aria-label="Open menu">
                        <Menu size={22} />
                    </Button>
                </div>

                {/* Right side - Notifications & User info */}
                <div className="flex items-center gap-3">
                    {/* Notification Bell */}
                    <NotificationBell variant="light" />

                    {/* User Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-3 px-2 hover:bg-secondary">
                                <span className="hidden text-sm font-medium text-foreground sm:block">{userName}</span>
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback className="bg-secondary text-foreground">{userInitials}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild>
                                <Link href="/admin/profile" className="flex items-center gap-2">
                                    <User size={16} />
                                    <span>Profil</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/admin/settings" className="flex items-center gap-2">
                                    <Settings size={16} />
                                    <span>Pengaturan</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/auth/logout" method="post" as="button" className="flex w-full items-center gap-2 text-destructive">
                                    <LogOut size={16} />
                                    <span>Logout</span>
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
