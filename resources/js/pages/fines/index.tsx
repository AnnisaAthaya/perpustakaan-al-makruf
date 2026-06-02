import { PayFineDialog, type PayFineItem } from '@/components/generated-components/pay-fine-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ServerTable } from '@/components/ui/server-table';
import MainLayout from '@/layouts/main-layout';
import { formatDateTime } from '@/lib/utils';
import type { Fine, PaginatedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { AlertTriangle, ArrowUpDown, BookMarked, ChevronLeft, ChevronRight, Clock, CreditCard, Receipt, Search } from 'lucide-react';
import { FormEvent, useState } from 'react';

// Page Props
interface PageProps {
    fines: PaginatedData<Fine>;
    qrisImage: string | null;
    finePerDay: number;
    stats: {
        unpaidCount: number;
        pendingCount: number;
        paidCount: number;
        totalUnpaid: number;
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

function getStatusBadge(status: Fine['status']) {
    const variants: Record<Fine['status'], { label: string; className: string }> = {
        unpaid: {
            label: 'Belum Bayar',
            className: 'bg-red-100 text-red-700 hover:bg-red-100',
        },
        pending_verification: {
            label: 'Menunggu Verifikasi',
            className: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
        },
        paid: {
            label: 'Lunas',
            className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
        },
    };
    return variants[status];
}

function getCategoryColor(category?: string) {
    if (!category) return 'from-slate-500 to-slate-700';
    const colors: Record<string, string> = {
        Sains: 'from-emerald-500 to-emerald-700',
        Matematika: 'from-blue-500 to-blue-700',
        'B. Inggris': 'from-amber-500 to-amber-700',
        'B. Indonesia': 'from-rose-500 to-rose-700',
        Sejarah: 'from-purple-500 to-purple-700',
    };
    return colors[category] || 'from-slate-500 to-slate-700';
}

// Transform Fine to PayFineItem for dialog
function transformToPayFineItem(fine: Fine, finePerDay: number): PayFineItem {
    return {
        id: fine.id,
        bookTitle: fine.loan?.book?.title || 'Unknown',
        bookAuthor: fine.loan?.book?.author || 'Unknown',
        bookCategory: fine.loan?.book?.category?.name || 'Umum',
        borrowDate: fine.loan?.borrowed_at || '',
        dueDate: fine.loan?.due_date || '',
        returnDate: fine.loan?.returned_at || null,
        daysOverdue: fine.late_days,
        finePerDay: finePerDay,
        totalFine: Number(fine.amount),
        status: fine.status === 'unpaid' ? 'belum_bayar' : fine.status === 'pending_verification' ? 'menunggu_verifikasi' : 'lunas',
        paymentProof: fine.payment_proof || null,
    };
}

// Mobile Card Component
function FineCard({ fine, finePerDay, onPay }: { fine: Fine; finePerDay: number; onPay: (fine: Fine) => void }) {
    const statusBadge = getStatusBadge(fine.status);
    const categoryName = fine.loan?.book?.category?.name;

    return (
        <Card className={`overflow-hidden ${fine.status === 'unpaid' ? 'border-red-200 bg-red-50/30' : ''}`}>
            <CardContent className="p-4">
                <div className="flex gap-4">
                    {/* Book Cover */}
                    <div
                        className={`shadow-soft-md flex aspect-[3/4] w-16 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br p-2 text-white ${getCategoryColor(categoryName)}`}
                    >
                        <BookMarked size={20} strokeWidth={1.5} className="mb-1 opacity-80" />
                        <p className="line-clamp-2 text-center text-[10px] leading-tight font-medium opacity-90">
                            {fine.loan?.book?.title || 'Unknown'}
                        </p>
                    </div>

                    {/* Fine Info */}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                                <h3 className="truncate text-base font-bold text-foreground">{fine.loan?.book?.title || 'Unknown'}</h3>
                                <p className="mt-0.5 text-sm text-muted-foreground">{fine.loan?.book?.author || 'Unknown'}</p>
                            </div>
                            <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                        </div>

                        {/* Overdue Info */}
                        <div className="mt-3 flex items-center gap-2">
                            <AlertTriangle size={14} className="text-red-500" />
                            <span className="text-sm font-medium text-red-600">Terlambat {fine.late_days} hari</span>
                        </div>

                        {/* Fine Amount */}
                        <div className="mt-2 rounded-lg bg-red-100 px-3 py-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-red-600">Total Denda</p>
                                    <p className="text-lg font-bold text-red-700">{formatCurrency(Number(fine.amount))}</p>
                                </div>
                                <p className="text-xs text-red-500">
                                    {fine.late_days} hari x {formatCurrency(finePerDay)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                {fine.status === 'unpaid' && (
                    <Button className="mt-4 w-full" onClick={() => onPay(fine)}>
                        <CreditCard size={14} className="mr-2" />
                        Bayar Denda
                    </Button>
                )}

                {fine.status === 'pending_verification' && (
                    <div className="mt-4 rounded-lg bg-amber-50 p-3 text-center">
                        <p className="text-sm font-medium text-amber-700">Bukti pembayaran sedang diverifikasi admin</p>
                    </div>
                )}

                {fine.status === 'paid' && (
                    <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-center">
                        <p className="text-sm font-medium text-emerald-700">Pembayaran telah diverifikasi</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// Table Columns
function createColumns(finePerDay: number, onPay: (fine: Fine) => void): ColumnDef<Fine>[] {
    return [
        {
            accessorKey: 'loan.book.title',
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
            cell: ({ row }) => {
                const categoryName = row.original.loan?.book?.category?.name;
                return (
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex h-10 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-white ${getCategoryColor(categoryName)}`}
                        >
                            <BookMarked size={14} />
                        </div>
                        <div className="max-w-[180px]">
                            <p className="truncate font-medium text-foreground">{row.original.loan?.book?.title || 'Unknown'}</p>
                            <p className="truncate text-xs text-muted-foreground">{row.original.loan?.book?.author || 'Unknown'}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'loan.due_date',
            header: 'Batas Kembali',
            cell: ({ row }) => (row.original.loan?.due_date ? formatDateTime(row.original.loan.due_date) : '-'),
        },
        {
            accessorKey: 'loan.returned_at',
            header: 'Tgl. Kembali',
            cell: ({ row }) => (row.original.loan?.returned_at ? formatDateTime(row.original.loan.returned_at) : '-'),
        },
        {
            accessorKey: 'late_days',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
                >
                    Keterlambatan
                    <ArrowUpDown size={14} className="ml-2" />
                </Button>
            ),
            cell: ({ row }) => <span className="font-medium text-red-600">{row.original.late_days} hari</span>,
        },
        {
            accessorKey: 'amount',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
                >
                    Total Denda
                    <ArrowUpDown size={14} className="ml-2" />
                </Button>
            ),
            cell: ({ row }) => <span className="font-bold text-red-600">{formatCurrency(Number(row.original.amount))}</span>,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const statusBadge = getStatusBadge(row.original.status);
                return <Badge className={statusBadge.className}>{statusBadge.label}</Badge>;
            },
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => {
                if (row.original.status === 'unpaid') {
                    return (
                        <Button size="sm" onClick={() => onPay(row.original)}>
                            <CreditCard size={14} className="mr-1" />
                            Bayar
                        </Button>
                    );
                }
                if (row.original.status === 'pending_verification') {
                    return (
                        <Badge variant="outline" className="text-amber-600">
                            <Clock size={12} className="mr-1" />
                            Verifikasi
                        </Badge>
                    );
                }
                return (
                    <Badge variant="outline" className="text-emerald-600">
                        <Receipt size={12} className="mr-1" />
                        Lunas
                    </Badge>
                );
            },
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
export default function Index() {
    const { fines, qrisImage, finePerDay, stats, filters } = usePage<{ props: PageProps }>().props as unknown as PageProps;
    const [selectedFine, setSelectedFine] = useState<PayFineItem | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isSearching, setIsSearching] = useState(false);

    const handlePay = (fine: Fine) => {
        setSelectedFine(transformToPayFineItem(fine, finePerDay));
        setIsDialogOpen(true);
    };

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        setIsSearching(true);
        router.get(
            '/fines',
            { search: searchQuery || undefined },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsSearching(false),
            },
        );
    };

    const columns = createColumns(finePerDay, handlePay);

    return (
        <MainLayout>
            <Head title="Denda Keterlambatan" />

            <div className="flex flex-col gap-6 pb-8">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="h-8 w-1.5 rounded-full bg-primary" />
                    <div>
                        <h1 className="text-xl font-bold text-foreground md:text-2xl">DENDA KETERLAMBATAN</h1>
                        <p className="text-sm text-muted-foreground">Kelola dan bayar denda keterlambatan pengembalian buku</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <StatsCard
                        icon={AlertTriangle}
                        label="Belum Dibayar"
                        value={stats.unpaidCount}
                        
                    />
                    <StatsCard
                        icon={Clock}
                        label="Menunggu Verifikasi"
                        value={stats.pendingCount}
                        
                    />
                    <StatsCard
                        icon={Receipt}
                        label="Sudah Lunas"
                        value={stats.paidCount}
                        
                    />
                    <StatsCard
                        icon={CreditCard}
                        label="Total Belum Bayar"
                        value={formatCurrency(stats.totalUnpaid)}
                        
                    />
                </div>

                {/* Alert for unpaid fines */}
                {stats.unpaidCount > 0 && (
                    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                        <AlertTriangle size={20} className="text-red-600" />
                        <div>
                            <p className="font-semibold text-red-800">Anda memiliki {stats.unpaidCount} denda yang belum dibayar</p>
                            <p className="mt-1 text-sm text-red-600">
                                Total denda: <strong>{formatCurrency(stats.totalUnpaid)}</strong>. Segera lakukan pembayaran untuk dapat meminjam buku
                                kembali.
                            </p>
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
                    {fines.data.length > 0 ? (
                        fines.data.map((fine) => <FineCard key={fine.id} fine={fine} finePerDay={finePerDay} onPay={handlePay} />)
                    ) : (
                        <Card className="py-12 text-center">
                            <CardContent>
                                <Receipt size={32} className="text-emerald-600" />
                                <h3 className="text-lg font-semibold text-foreground">Tidak Ada Denda</h3>
                                <p className="mt-2 text-sm text-muted-foreground">Anda tidak memiliki denda keterlambatan. Pertahankan!</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Mobile Pagination */}
                {fines.last_page > 1 && (
                    <div className="flex flex-col gap-3 lg:hidden">
                        <div className="text-center text-sm text-muted-foreground">
                            Halaman {fines.current_page} dari {fines.last_page}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    setIsSearching(true);
                                    router.get(
                                        fines.prev_page_url || '/fines',
                                        { search: searchQuery || undefined },
                                        {
                                            preserveState: true,
                                            preserveScroll: true,
                                            onFinish: () => setIsSearching(false),
                                        },
                                    );
                                }}
                                disabled={!fines.prev_page_url || isSearching}
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
                                        fines.next_page_url || '/fines',
                                        { search: searchQuery || undefined },
                                        {
                                            preserveState: true,
                                            preserveScroll: true,
                                            onFinish: () => setIsSearching(false),
                                        },
                                    );
                                }}
                                disabled={!fines.next_page_url || isSearching}
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
                        data={fines}
                        searchPlaceholder="Cari judul buku..."
                        searchValue={filters.search}
                        routePath="/fines"
                    />
                </div>
            </div>

            {/* Pay Fine Dialog */}
            <PayFineDialog
                fine={selectedFine}
                fineId={selectedFine?.id || null}
                qrisImage={qrisImage}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            />
        </MainLayout>
    );
}
