import Footer from '@/components/footer';
import Navbar from '@/components/navbar';
import { ReactNode } from 'react';

interface GuestLayoutProps {
    children: ReactNode;
    /** Tampilkan footer (default: true) */
    showFooter?: boolean;
}

export default function GuestLayout({ children, showFooter = true }: GuestLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
            <Navbar variant="primary" />

            <main className="mx-auto mt-4 w-full max-w-7xl flex-1 px-4 md:mt-6 md:px-6 lg:px-8">{children}</main>

            {showFooter && <Footer />}
        </div>
    );
}
