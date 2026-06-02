import { ReturnBookDialog, type ActiveLoanItem } from '@/components/generated-components/return-book-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ServerTable } from '@/components/ui/server-table';
import MainLayout from '@/layouts/main-layout';
import { formatDateTime } from '@/lib/utils';
import type { PaginatedData } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { AlertTriangle, ArrowUpDown, BookMarked, Calendar, ChevronLeft, ChevronRight, Clock, Eye, Search } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface PageProps {
    activeLoans: PaginatedData<ActiveLoanItem>;
    stats: {
        totalBorrowed: number;
        onTime: number;
        overdue: number;
        totalFines: number;
    };
    filters: {
        search?: string;
    };
}

// Helper functions (formatDateTime now imported from utils)

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}

function getDisplayStatus(loan: ActiveLoanItem): 'dipinjam' | 'terlambat' {
    return loan.is_overdue ? 'terlambat' : 'dipinjam';
}

function getStatusBadge(displayStatus: 'dipinjam' | 'terlambat') {
    const variants = {
        dipinjam: {
            label: 'Dipinjam',
            className: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
        },
        terlambat: {
            label: 'Terlambat',
            className: 'bg-red-100 text-red-700 hover:bg-red-100',
        },
    };
    return variants[displayStatus];
}

function getDaysRemainingText(loan: ActiveLoanItem): { text: string; className: string } {
    if (loan.is_overdue) {
        return {
            text: `Terlambat ${loan.overdue_days} hari`,
            className: 'text-red-600 font-semibold',
        };
    } else if (loan.days_remaining === 0) {
        return {
            text: 'Hari ini batas kembali',
            className: 'text-amber-600 font-semibold',
        };
    } else if (loan.days_remaining === 1) {
        return {
            text: 'Besok batas kembali',
            className: 'text-amber-600',
        };
    } else {
        return {
            text: `${loan.days_remaining} hari lagi`,
            className: 'text-emerald-600',
        };
    }
}

function getCategoryColor(category: string) {
    const colors: Record<string, string> = {
        Sains: 'from-emerald-500 to-emerald-700',
        Matematika: 'from-blue-500 to-blue-700',
        'B. Inggris': 'from-amber-500 to-amber-700',
        'B. Indonesia': 'from-rose-500 to-rose-700',
        Sejarah: 'from-purple-500 to-purple-700',
        Agama: 'from-teal-500 to-teal-700',
        Fiksi: 'from-pink-500 to-pink-700',
    };
    return colors[category] || 'from-emerald-600 to-emerald-800';
}

// Mobile Card Component
function ActiveLoanCard({ loan, onViewDetail }: { loan: ActiveLoanItem; onViewDetail: (loan: ActiveLoanItem) => void }) {
    const displayStatus = getDisplayStatus(loan);
    const statusBadge = getStatusBadge(displayStatus);
    const daysInfo = getDaysRemainingText(loan);

    return (
        <Card className={`overflow-hidden ${loan.is_overdue ? 'border-red-200 bg-red-50/30' : ''}`}>
            <CardContent className="p-4">
                <div className="flex gap-4">
                    {/* Book Cover */}
                    {loan.book.cover ? (
                        <div className="h-24 w-16 flex-shrink-0 overflow-hidden rounded-xl shadow-md">
                            <img src={`/storage/${loan.book.cover}`} alt={loan.book.title} className="h-full w-full object-cover" />
                        </div>
                    ) : (
                        <div
                            className={`shadow-soft-md flex aspect-[3/4] w-16 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br p-2 text-white ${getCategoryColor(loan.book.category)}`}
                        >
                            <BookMarked size={20} strokeWidth={1.5} className="mb-1 opacity-80" />
                            <p className="line-clamp-2 text-center text-[10px] leading-tight font-medium opacity-90">{loan.book.title}</p>
                        </div>
                    )}

                    {/* Book Info */}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                                <h3 className="truncate text-base font-bold text-foreground">{loan.book.title}</h3>
                                <p className="mt-0.5 text-sm text-muted-foreground">{loan.book.author}</p>
                            </div>
                            <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-1.5">
                                <Calendar size={12} className="text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Pinjam:</span>
                                <span className="text-xs font-medium">{formatDateTime(loan.borrowed_at)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock size={12} className="text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Batas:</span>
                                <span className="text-xs font-medium">{formatDateTime(loan.due_date)}</span>
                            </div>
                        </div>

                        {/* Days Remaining / Overdue */}
                        <div className="mt-2 flex items-center gap-2">
                            {loan.is_overdue && <AlertTriangle size={14} className="text-red-500" />}
                            <span className={`text-sm ${daysInfo.className}`}>{daysInfo.text}</span>
                        </div>

                        {/* Fine if overdue */}
                        {loan.is_overdue && loan.estimated_fine > 0 && (
                            <div className="mt-2 rounded-lg bg-red-100 px-2 py-1">
                                <span className="text-xs text-red-600">Estimasi Denda: </span>
                                <span className="text-sm font-bold text-red-700">{formatCurrency(loan.estimated_fine)}</span>
                            </div>
                        )}
                    </div>
                </div>

                <Button variant="outline" className="mt-4 w-full" onClick={() => onViewDetail(loan)}>
                    <Eye size={14} className="mr-2" />
                    Lihat Detail
                </Button>
            </CardContent>
        </Card>
    );
}

// Table Columns
function createColumns(onViewDetail: (loan: ActiveLoanItem) => void): ColumnDef<ActiveLoanItem>[] {
    return [
        {
            accessorKey: 'book.title',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
                >
                    Judul Buku
                    <ArrowUpDown size={14} className="ml-2" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    {row.original.book.cover ? (
                        <div className="h-10 w-8 overflow-hidden rounded-lg">
                            <img src={`/storage/${row.original.book.cover}`} alt={row.original.book.title} className="h-full w-full object-cover" />
                        </div>
                    ) : (
                        <div
                            className={`flex h-10 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-white ${getCategoryColor(row.original.book.category)}`}
                        >
                            <BookMarked size={14} />
                        </div>
                    )}
                    <div className="max-w-[180px]">
                        <p className="truncate font-medium text-foreground">{row.original.book.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{row.original.book.author}</p>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'borrowed_at',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
                >
                    Tgl. Pinjam
                    <ArrowUpDown size={14} className="ml-2" />
                </Button>
            ),
            cell: ({ row }) => formatDateTime(row.original.borrowed_at),
        },
        {
            accessorKey: 'due_date',
            header: 'Batas Kembali',
            cell: ({ row }) => formatDateTime(row.original.due_date),
        },
        {
            id: 'daysRemaining',
            header: 'Sisa Waktu',
            cell: ({ row }) => {
                const daysInfo = getDaysRemainingText(row.original);
                return (
                    <div className="flex items-center gap-1.5">
                        {row.original.is_overdue && <AlertTriangle size={14} className="text-red-500" />}
                        <span className={daysInfo.className}>{daysInfo.text}</span>
                    </div>
                );
            },
        },
        {
            id: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const displayStatus = getDisplayStatus(row.original);
                const statusBadge = getStatusBadge(displayStatus);
                return <Badge className={statusBadge.className}>{statusBadge.label}</Badge>;
            },
        },
        {
            id: 'fine',
            header: 'Denda',
            cell: ({ row }) => {
                if (!row.original.is_overdue || row.original.estimated_fine === 0) {
                    return <span className="text-muted-foreground">-</span>;
                }
                return <span className="font-semibold text-red-600">{formatCurrency(row.original.estimated_fine)}</span>;
            },
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => (
                <Button variant="outline" size="sm" onClick={() => onViewDetail(row.original)}>
                    <Eye size={14} className="mr-1" />
                    Detail
                </Button>
            ),
        },
    ];
}

// Stats Card
function StatsCard({ icon: Icon, label, value, className }: { icon: React.ElementType; label: string; value: string | number; className?: string }) {
    return (
        <Card className={className}>
            <CardContent className="flex items-center justify-between p-5">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
                </div>
                <Icon size={28} className="text-primary shrink-0" />
            </CardContent>
        </Card>
    );
}
export default function Index({ activeLoans, stats, filters }: PageProps) {
    const [selectedLoan, setSelectedLoan] = useState<ActiveLoanItem | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isSearching, setIsSearching] = useState(false);

    const handleViewDetail = (loan: ActiveLoanItem) => {
        setSelectedLoan(loan);
        setIsDialogOpen(true);
    };

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        setIsSearching(true);
        router.get(
            '/returns',
            { search: searchQuery || undefined },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsSearching(false),
            },
        );
    };

    const columns = createColumns(handleViewDetail);

    return (
        <MainLayout>
            <Head title="Pengembalian Buku" />

            <div className="flex flex-col gap-6 pb-8">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="h-8 w-1.5 rounded-full bg-primary" />
                    <div>
                        <h1 className="text-xl font-bold text-foreground md:text-2xl">PENGEMBALIAN BUKU</h1>
                        <p className="text-sm text-muted-foreground">Daftar buku yang sedang Anda pinjam</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <StatsCard
                        icon={BookMarked}
                        label="Sedang Dipinjam"
                        value={stats.totalBorrowed}
                        
                    />
                    <StatsCard
                        icon={Clock}
                        label="Tepat Waktu"
                        value={stats.onTime}
                        
                    />
                    <StatsCard
                        icon={AlertTriangle}
                        label="Terlambat"
                        value={stats.overdue}
                        
                    />
                    <StatsCard
                        icon={Clock}
                        label="Total Denda"
                        value={formatCurrency(stats.totalFines)}
                        
                    />
                </div>

                {/* Alert for overdue books */}
                {stats.overdue > 0 && (
                    <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                        <AlertTriangle size={20} className="text-red-600" />
                        <div>
                            <p className="font-semibold text-red-800">Anda memiliki {stats.overdue} buku yang terlambat dikembalikan</p>
                            <p className="text-sm text-red-600">Segera kembalikan ke perpustakaan untuk menghindari denda yang lebih besar.</p>
                        </div>
                    </div>
                )}

                {/* Mobile Search - Only visible on mobile */}
                <div className="lg:hidden">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input
                            placeholder="Cari judul buku..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            disabled={isSearching}
                            className="flex-1"
                        />
                        <Button type="submit" disabled={isSearching} className="gap-2">
                            <Search size={18} />
                            Cari
                        </Button>
                    </form>
                </div>

                {/* Mobile View - Cards */}
                <div className="flex flex-col gap-3 lg:hidden">
                    {activeLoans.data.length === 0 ? (
                        <Card className="py-12 text-center">
                            <CardContent>
                                <BookMarked size={48} className="text-muted-foreground" />
                                <h3 className="text-lg font-semibold text-foreground">Tidak Ada Buku Dipinjam</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {filters.search
                                        ? 'Tidak ada buku yang sesuai dengan pencarian.'
                                        : 'Anda tidak memiliki buku yang sedang dipinjam saat ini.'}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        activeLoans.data.map((loan) => <ActiveLoanCard key={loan.id} loan={loan} onViewDetail={handleViewDetail} />)
                    )}
                </div>

                {/* Mobile Pagination */}
                {activeLoans.last_page > 1 && (
                    <div className="flex flex-col gap-3 lg:hidden">
                        <div className="text-center text-sm text-muted-foreground">
                            Halaman {activeLoans.current_page} dari {activeLoans.last_page}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    setIsSearching(true);
                                    router.get(
                                        activeLoans.prev_page_url || '/returns',
                                        { search: searchQuery || undefined },
                                        {
                                            preserveState: true,
                                            preserveScroll: true,
                                            onFinish: () => setIsSearching(false),
                                        },
                                    );
                                }}
                                disabled={!activeLoans.prev_page_url || isSearching}
                            >
                                <ChevronLeft size={16} className="mr-1" />
                                Sebelumnya
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    setIsSearching(true);
                                    router.get(
                                        activeLoans.next_page_url || '/returns',
                                        { search: searchQuery || undefined },
                                        {
                                            preserveState: true,
                                            preserveScroll: true,
                                            onFinish: () => setIsSearching(false),
                                        },
                                    );
                                }}
                                disabled={!activeLoans.next_page_url || isSearching}
                            >
                                Selanjutnya
                                <ChevronRight size={16} className="ml-1" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Desktop View - Table */}
                <div className="hidden lg:block">
                    <ServerTable
                        columns={columns}
                        data={activeLoans}
                        searchPlaceholder="Cari judul buku..."
                        searchValue={filters.search}
                        routePath="/returns"
                    />
                </div>
            </div>

            {/* Return Book Dialog */}
            <ReturnBookDialog loan={selectedLoan} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
        </MainLayout>
    );
}
