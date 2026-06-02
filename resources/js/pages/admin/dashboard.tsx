import { Card, CardContent } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin/admin-layout';
import { Head } from '@inertiajs/react';
import { BookOpen, CheckSquare, LucideIcon, ShoppingCart, Tag, UserCog, Users } from 'lucide-react';

interface DashboardStats {
    admin_count: number;
    book_count: number;
    member_count: number;
    category_count: number;
    borrowed_count: number;
    overdue_count: number;
    loan_count: number;
    return_count: number;
}

interface DashboardProps {
    stats: DashboardStats;
}

interface StatCardProps {
    title: string;
    value: number;
    icon: LucideIcon;
    variant?: 'default' | 'primary';
}

function StatCard({ title, value, icon: Icon, variant = 'default' }: StatCardProps) {
    const isPrimary = variant === 'primary';

    return (
        <Card className={isPrimary ? 'border-primary/30 bg-secondary' : ''}>
            <CardContent className="flex items-center justify-between p-5">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="mt-1 text-3xl font-bold text-foreground">{value}</p>
                </div>
                <Icon size={24} className={isPrimary ? 'text-primary' : 'text-muted-foreground'} />
            </CardContent>
        </Card>
    );
}

function LargeStatCard({ title, value, icon: Icon }: StatCardProps) {
    return (
        <Card className="border-primary/30 bg-secondary">
            <CardContent className="flex items-center justify-between p-6">
                <div>
                    <p className="text-base font-medium text-muted-foreground">{title}</p>
                    <p className="mt-2 text-4xl font-bold text-foreground">{value}</p>
                </div>
                <Icon size={28} className="text-primary" />
            </CardContent>
        </Card>
    );
}

export default function Dashboard({ stats }: DashboardProps) {
    return (
        <AdminLayout>
            <Head title="Dashboard Admin" />

            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                    <p className="mt-1 text-muted-foreground">Selamat datang di panel admin perpustakaan</p>
                </div>

                {/* Stats Grid - Row 1 */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Admin" value={stats.admin_count} icon={UserCog} />
                    <StatCard title="Data Buku" value={stats.book_count} icon={BookOpen} variant="primary" />
                    <StatCard title="Data Anggota" value={stats.member_count} icon={Users} variant="primary" />
                    <StatCard title="Kategori Buku" value={stats.category_count} icon={Tag} />
                </div>

                {/* Stats Grid - Row 2 */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <StatCard title="Buku yang dipinjam" value={stats.borrowed_count} icon={ShoppingCart} />
                    <StatCard title="Buku yang terlambat" value={stats.overdue_count} icon={ShoppingCart} variant="primary" />
                </div>

                {/* Stats Grid - Row 3 */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <LargeStatCard title="Data Peminjaman" value={stats.loan_count} icon={ShoppingCart} />
                    <LargeStatCard title="Data Pengembalian" value={stats.return_count} icon={CheckSquare} />
                </div>
            </div>
        </AdminLayout>
    );
}
