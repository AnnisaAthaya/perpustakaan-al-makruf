import AdminNavbar from '@/components/admin/admin-navbar';
import AdminSidebar from '@/components/admin/admin-sidebar';
import { usePage } from '@inertiajs/react';
import { ReactNode, useState } from 'react';

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { url } = usePage();

    return (
        <>
            <div className="min-h-screen bg-background">
                {/* Sidebar */}
                <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} currentPath={url} />

                {/* Main Content Area - offset by sidebar width on desktop */}
                <div className="flex min-h-screen flex-col md:ml-64">
                    {/* Navbar */}
                    <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />

                    {/* Page Content */}
                    <main className="flex-1 p-4 md:p-6">{children}</main>
                </div>
            </div>
        </>
    );
}
