import Logo from '@/components/logo';
import NotificationBell from '@/components/notification-bell';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookUser, LogIn, LogOut, Menu } from 'lucide-react';

interface NavLink {
    label: string;
    href: string;
}

interface NavbarProps {
    /** Variant navbar - 'primary' untuk bg emerald, 'light' untuk bg putih */
    variant?: 'primary' | 'light';
    /** Callback untuk toggle sidebar (opsional, untuk main layout) */
    onSidebarToggle?: () => void;
    /** Tampilkan tombol sidebar toggle di mobile */
    showSidebarToggle?: boolean;
    /** Custom navigation links */
    navLinks?: NavLink[];
}

const defaultNavLinks: NavLink[] = [
    { label: 'Beranda', href: '/' },
    { label: 'Katalog Buku', href: '/books' },
];

export default function Navbar({ variant = 'primary', onSidebarToggle, showSidebarToggle = false, navLinks = defaultNavLinks }: NavbarProps) {
    const { auth } = usePage<SharedData & { url: string }>().props;
    const { url } = usePage();

    const isPrimary = variant === 'primary';

    // Check if a link is active
    const isActive = (href: string) => {
        if (href === '/') {
            return url === '/';
        }
        return url?.startsWith(href);
    };

    // Style classes based on variant
    const styles = {
        nav: isPrimary ? 'bg-primary shadow-md' : 'bg-card shadow-soft border-b border-border',
        logo: isPrimary ? 'bg-white/15 text-white' : 'bg-primary text-primary-foreground',
        title: isPrimary ? 'text-white' : 'text-primary',
        subtitle: isPrimary ? 'text-primary-foreground/80' : 'text-muted-foreground',
        link: isPrimary ? 'text-primary-foreground/90 hover:text-white' : 'text-foreground/70 hover:text-primary',
        linkActive: isPrimary ? 'text-white font-bold' : 'text-primary font-bold',
        menuButton: isPrimary ? 'text-white hover:bg-white/10' : 'text-foreground hover:bg-secondary',
    };

    const NavLinks = ({ isMobile = false }: { isMobile?: boolean }) => (
        <>
            {navLinks.map((link) => {
                const active = isActive(link.href);

                return (
                    <Link
                        key={link.href + link.label}
                        href={link.href}
                        className={cn(
                            isMobile ? 'block rounded-xl px-4 py-3 text-base font-medium transition-colors' : 'text-sm font-medium transition-colors',
                            isMobile
                                ? active
                                    ? 'bg-primary/10 font-bold text-primary'
                                    : 'text-foreground hover:bg-secondary'
                                : active
                                  ? styles.linkActive
                                  : styles.link,
                        )}
                    >
                        {link.label}
                    </Link>
                );
            })}

            {/* Add Isi Kunjungan for siswa users only */}
            {auth?.user && auth.user.role === 'siswa' && (
                <Link
                    href="/visits"
                    className={cn(
                        isMobile ? 'block rounded-xl px-4 py-3 text-base font-medium transition-colors' : 'text-sm font-medium transition-colors',
                        isMobile
                            ? isActive('/visits')
                                ? 'bg-primary/10 font-bold text-primary'
                                : 'text-foreground hover:bg-secondary'
                            : isActive('/visits')
                              ? styles.linkActive
                              : styles.link,
                    )}
                >
                    {isMobile && <BookUser size={16} className="mr-2 inline" />}
                    Isi Kunjungan
                </Link>
            )}
        </>
    );

    const AuthButton = ({ isMobile = false }: { isMobile?: boolean }) => {
        if (auth?.user) {
            return (
                <Button variant="destructive" size={isMobile ? 'lg' : 'sm'} className={isMobile ? 'w-full' : ''} asChild>
                    <Link href="/auth/logout" method="post" as="button">
                        <LogOut size={16} className="mr-2" />
                        Logout
                    </Link>
                </Button>
            );
        }

        return (
            <Button
                variant={isMobile ? 'default' : isPrimary ? 'secondary' : 'default'}
                size={isMobile ? 'lg' : 'sm'}
                className={isMobile ? 'w-full' : ''}
                asChild
            >
                <Link href="/auth/login">
                    <LogIn size={16} className="mr-2" />
                    Login
                </Link>
            </Button>
        );
    };

    return (
        <nav className={`sticky top-0 z-30 ${styles.nav}`}>
            <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 md:px-6 md:py-4">
                <div className="flex items-center justify-between">
                    {/* Left Side: Sidebar Toggle (optional) & Logo */}
                    <div className="flex items-center gap-3 md:gap-4">
                        {showSidebarToggle && onSidebarToggle && (
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={onSidebarToggle}
                                className={`md:hidden ${styles.menuButton}`}
                                aria-label="Toggle sidebar"
                            >
                                <Menu size={22} />
                            </Button>
                        )}

                        <Link href="/" className="flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm bg-white">
                                <Logo size={32} className="h-full w-full object-contain" />
                            </div>
                            <div className="overflow-hidden">
                                <h1 className={`truncate text-base leading-tight font-bold md:text-lg ${styles.title}`}>MA Al-Ma'ruf</h1>
                                <p className={`truncate text-xs ${styles.subtitle}`}>Perpustakaan Digital</p>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden items-center gap-6 md:flex lg:gap-8">
                        <NavLinks />
                        <div className="flex items-center gap-4">
                            {auth?.user && <NotificationBell variant={variant} />}
                            <AuthButton />
                        </div>
                    </div>

                    {/* Mobile Menu - Sheet */}
                    <div className="flex items-center gap-2 md:hidden">
                        {auth?.user && <NotificationBell variant={variant} />}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon-sm" className={styles.menuButton} aria-label="Open menu">
                                    <Menu size={22} />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-80">
                                <SheetHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white">
                                            <Logo size={32} className="h-full w-full object-contain" />
                                        </div>
                                        <div>
                                            <SheetTitle>MA Al-Ma'ruf</SheetTitle>
                                            <p className="text-xs text-muted-foreground">Perpustakaan Digital</p>
                                        </div>
                                    </div>
                                </SheetHeader>

                                <div className="mt-6 flex flex-col gap-1">
                                    <NavLinks isMobile />
                                </div>

                                <Separator className="my-6" />

                                <div className="px-2">
                                    <AuthButton isMobile />
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </nav>
    );
}
