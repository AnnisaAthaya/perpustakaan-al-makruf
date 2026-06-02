import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Ban, BookOpen, CheckSquare, Clock, LogIn, LucideIcon, RotateCcw, Settings } from 'lucide-react';
import { ReactNode } from 'react';

interface SidebarLinkProps {
    href: string;
    children: ReactNode;
    icon: ReactNode;
    active?: boolean;
}

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

interface MenuItem {
    label: string;
    href: string;
    icon: LucideIcon;
    requiresAuth?: boolean;
}

interface MenuSection {
    title: string;
    items: MenuItem[];
    requiresAuth?: boolean;
}

const menuSections: MenuSection[] = [
    {
        title: 'Menu Utama',
        items: [
            { label: 'Katalog Buku', href: '/books', icon: BookOpen, requiresAuth: false },
            { label: 'Riwayat Peminjaman', href: '/loans', icon: Clock, requiresAuth: true },
            { label: 'Pengembalian Buku', href: '/returns', icon: RotateCcw, requiresAuth: true },
            { label: 'Denda Keterlambatan', href: '/fines', icon: Ban, requiresAuth: true },
            { label: 'Bebas Pustaka', href: '/clearance', icon: CheckSquare, requiresAuth: true },
        ],
    },
    {
        title: 'Pengaturan',
        requiresAuth: true,
        items: [{ label: 'Profil & Akun', href: '/settings', icon: Settings, requiresAuth: true }],
    },
];

function SidebarLink({ href, children, icon, active = false }: SidebarLinkProps) {
    return (
        <Link
            href={href}
            className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium',
                active ? 'shadow-soft bg-secondary text-primary' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
            )}
        >
            {icon}
            {children}
        </Link>
    );
}

function SidebarContent({ isAuthenticated }: { isAuthenticated: boolean }) {
    const { url } = usePage();

    const isActive = (href: string) => {
        if (href === '#') return false;
        return url.startsWith(href);
    };

    // Filter sections and items based on auth status
    const visibleSections = menuSections
        .filter((section) => !section.requiresAuth || isAuthenticated)
        .map((section) => ({
            ...section,
            items: section.items.filter((item) => !item.requiresAuth || isAuthenticated),
        }))
        .filter((section) => section.items.length > 0);

    return (
        <div className="space-y-6">
            {visibleSections.map((section, index) => (
                <div key={section.title}>
                    {index > 0 && <Separator className="mb-6" />}
                    <h3 className="mb-3 px-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase">{section.title}</h3>
                    <div className="space-y-1">
                        {section.items.map((item) => (
                            <SidebarLink key={item.label} href={item.href} icon={<item.icon size={18} />} active={isActive(item.href)}>
                                {item.label}
                            </SidebarLink>
                        ))}
                    </div>
                </div>
            ))}

            {/* Login prompt for guests */}
            {!isAuthenticated && (
                <>
                    <Separator />
                    <div className="rounded-xl bg-primary/5 p-4">
                        <p className="mb-3 text-sm text-muted-foreground">Login untuk mengakses fitur peminjaman buku</p>
                        <Button className="w-full" asChild>
                            <Link href="/auth/login">
                                <LogIn size={16} className="mr-2" />
                                Login
                            </Link>
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { auth } = usePage<SharedData>().props;
    const isAuthenticated = !!auth?.user;

    return (
        <>
            {/* Desktop Sidebar - Always visible on md+ */}
            <aside className="sticky top-24 hidden h-fit w-72 flex-shrink-0 md:block">
                <div className="shadow-soft rounded-2xl border border-border bg-card p-5">
                    <SidebarContent isAuthenticated={isAuthenticated} />
                </div>
            </aside>

            {/* Mobile Sidebar - Sheet */}
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent side="left" className="w-80 p-0">
                    <SheetHeader className="border-b border-border p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-1.5">
                                <Logo size={32} className="h-full w-full object-contain" />
                            </div>
                            <div>
                                <SheetTitle>Menu</SheetTitle>
                                <p className="text-xs text-muted-foreground">Perpustakaan MA Al-Ma'ruf</p>
                            </div>
                        </div>
                    </SheetHeader>

                    <div className="p-4">
                        <SidebarContent isAuthenticated={isAuthenticated} />
                    </div>

                    {isAuthenticated && (
                        <div className="mt-auto border-t border-border p-4">
                            <Button variant="outline" className="w-full" asChild>
                                <Link href="/auth/logout" method="post" as="button">
                                    Logout
                                </Link>
                            </Button>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
}
