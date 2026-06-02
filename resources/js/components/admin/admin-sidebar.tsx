import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import {
    BookOpen,
    BookUser,
    CreditCard,
    FolderOpen,
    LayoutDashboard,
    LucideIcon,
    RotateCcw,
    Settings2,
    Shield,
    ShoppingCart,
    Users,
} from 'lucide-react';
import { ReactNode } from 'react';

interface SidebarLinkProps {
    href: string;
    children: ReactNode;
    icon: ReactNode;
    active?: boolean;
}

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    currentPath?: string;
}

interface MenuItem {
    label: string;
    href: string;
    icon: LucideIcon;
}

interface MenuSection {
    title: string;
    items: MenuItem[];
}

const menuSections: MenuSection[] = [
    {
        title: 'Admin',
        items: [{ label: 'Dashboard', href: '/admin', icon: LayoutDashboard }],
    },
    {
        title: 'Menu',
        items: [
            { label: 'Data Buku', href: '/admin/books', icon: BookOpen },
            { label: 'Data Peminjaman', href: '/admin/loans', icon: ShoppingCart },
            { label: 'Data Pengembalian', href: '/admin/returns', icon: RotateCcw },
            { label: 'Verifikasi Denda', href: '/admin/fines', icon: CreditCard },
        ],
    },
    {
        title: 'Setting',
        items: [
            { label: 'Kelola Siswa', href: '/admin/users', icon: Users },
            { label: 'Kelola Admin', href: '/admin/admins', icon: Shield },
            { label: 'Data Kunjungan', href: '/admin/visits', icon: BookUser },
            { label: 'Kategori Buku', href: '/admin/categories', icon: FolderOpen },
            { label: 'Pengaturan', href: '/admin/settings', icon: Settings2 },
        ],
    },
];

function SidebarLink({ href, children, icon, active = false }: SidebarLinkProps) {
    return (
        <Link
            href={href}
            className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium',
                active ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white',
            )}
        >
            {icon}
            {children}
        </Link>
    );
}

function SidebarContent({ currentPath }: { currentPath?: string }) {
    const isActive = (href: string) => {
        if (href === '/admin') {
            return currentPath === '/admin' || currentPath === '/admin/';
        }
        return currentPath?.startsWith(href) ?? false;
    };

    return (
        <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="px-4 py-5">
                <h1 className="tracking-wide text-white">ADMIN DASHBOARD</h1>
            </div>

            <Separator className="bg-white/20" />

            {/* Menu Sections */}
            <div className="flex-1 space-y-6 overflow-y-auto px-2 py-4">
                {menuSections.map((section) => (
                    <div key={section.title}>
                        <h3 className="mb-2 px-4 text-xs font-semibold tracking-wider text-white/50 uppercase">{section.title}</h3>
                        <div className="space-y-1">
                            {section.items.map((item) => (
                                <SidebarLink key={item.href} href={item.href} icon={<item.icon size={18} />} active={isActive(item.href)}>
                                    {item.label}
                                </SidebarLink>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function AdminSidebar({ isOpen, onClose, currentPath }: AdminSidebarProps) {
    return (
        <>
            {/* Desktop Sidebar - Fixed left */}
            <aside className="fixed top-0 left-0 z-40 hidden h-screen w-64 bg-primary md:block">
                <SidebarContent currentPath={currentPath} />
            </aside>

            {/* Mobile Sidebar - Sheet */}
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent side="left" className="w-64 border-0 bg-primary p-0">
                    <SheetHeader className="sr-only">
                        <SheetTitle>Menu Admin</SheetTitle>
                    </SheetHeader>
                    <SidebarContent currentPath={currentPath} />

                    <div className="absolute right-0 bottom-0 left-0 border-t border-white/20 p-4">
                        <Button variant="secondary" className="w-full" asChild>
                            <Link href="/auth/logout" method="post" as="button">
                                Logout
                            </Link>
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
