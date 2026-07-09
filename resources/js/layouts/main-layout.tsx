import Navbar from '@/components/navbar';
import Sidebar from '@/components/sidebar';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { ReactNode, useState } from 'react';

interface MainLayoutProps {
    children: ReactNode;
    /** Konten untuk sidebar kanan (opsional) */
    rightSidebar?: ReactNode;
    /** Sembunyikan sidebar kiri (default: false) */
    hideLeftSidebar?: boolean;
}

export default function MainLayout({ children, rightSidebar, hideLeftSidebar = false }: MainLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    useFlashToast();

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <>
            <div className="min-h-screen bg-background font-sans text-foreground">
                <Navbar variant="primary" showSidebarToggle onSidebarToggle={toggleSidebar} />

                <div className="mx-auto mt-4 flex w-full max-w-screen-2xl items-start gap-5 px-4 md:mt-6 md:gap-6 md:px-6 lg:px-8">
                    {/* Left Sidebar - Desktop */}
                    {!hideLeftSidebar && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}

                    {/* Mobile Sidebar (Sheet) - Only when left sidebar is hidden */}
                    {hideLeftSidebar && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}

                    {/* Main Content */}
                    <main className="min-w-0 flex-1 pb-8">{children}</main>

                    {/* Right Sidebar - Desktop Only */}
                    {rightSidebar && <aside className="sticky top-24 hidden h-fit w-80 flex-shrink-0 space-y-5 lg:block">{rightSidebar}</aside>}
                </div>
            </div>
        </>
    );
}
