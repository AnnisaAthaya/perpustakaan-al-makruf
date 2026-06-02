import { LoanDetailDialog, type LoanDetailItem } from '@/components/generated-components/loan-detail-dialog';
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
import { ArrowUpDown, BookOpen, Calendar, ChevronLeft, ChevronRight, Clock, Eye, Hourglass, Search, XCircle } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { CancelLoanDialog } from './components/cancel-loan-dialog';

interface PageProps {
    loans: PaginatedData<LoanDetailItem>;
    stats: {
        totalLoans: number;
        pendingLoans: number;
        activeLoans: number;
        overdueLoans: number;
        totalFines: number;
    };
    filters: {
        search?: string;
    };
}

// Helper functions (formatDateTime now imported from utils)

type DisplayStatus = 'menunggu' | 'dipinjam' | 'dikembalikan' | 'terlambat' | 'ditolak' | 'dibatalkan';

function getDisplayStatus(loan: LoanDetailItem): DisplayStatus {
    if (loan.status === 'pending') return 'menunggu';
    if (loan.status === 'rejected') return 'ditolak';
    if (loan.status === 'cancelled') return 'dibatalkan';
    if (loan.status === 'returned') return 'dikembalikan';
    if (loan.is_overdue) return 'terlambat';
    return 'dipinjam';
}

function getStatusBadge(displayStatus: DisplayStatus) {
    const variants = {
        menunggu: {
            label: 'Menunggu',
            className: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
        },
        dipinjam: {
            label: 'Dipinjam',
            className: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
        },
        dikembalikan: {
            label: 'Dikembalikan',
            className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
        },
        terlambat: {
            label: 'Terlambat',
            className: 'bg-red-100 text-red-700 hover:bg-red-100',
        },
        ditolak: {
            label: 'Ditolak',
            className: 'bg-red-100 text-red-700 hover:bg-red-100',
        },
        dibatalkan: {
            label: 'Dibatalkan',
            className: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
        },
    };
    return variants[displayStatus];
}

function getFineStatusBadge(fineStatus: 'unpaid' | 'pending_verification' | 'paid') {
    const variants = {
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
    return variants[fineStatus];
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}

// Mobile Card Component
function LoanCard({
    loan,
    onViewDetail,
    onCancelRequest,
}: {
    loan: LoanDetailItem;
    onViewDetail: (loan: LoanDetailItem) => void;
    onCancelRequest: (loan: LoanDetailItem) => void;
}) {
    const displayStatus = getDisplayStatus(loan);
    const statusBadge = getStatusBadge(displayStatus);
    const fineAmount = loan.fine?.amount ?? (loan.is_overdue ? (loan.estimated_fine ?? 0) : 0);
    const fineStatus = loan.fine?.status ?? (loan.is_overdue ? 'unpaid' : null);
    const fineStatusBadge = fineStatus ? getFineStatusBadge(fineStatus) : null;
    const isPending = loan.status === 'pending';

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-bold text-foreground">{loan.book.title}</h3>
                        <p className="mt-0.5 text-sm text-muted-foreground">{loan.book.author}</p>
                    </div>
                    <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    {isPending ? (
                        <div className="col-span-2 flex items-center gap-2">
                            <Clock size={14} className="text-amber-500" />
                            <div>
                                <p className="text-xs text-muted-foreground">Tanggal Permintaan</p>
                                <p className="font-medium">{formatDateTime(loan.requested_at)}</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Tanggal Pinjam</p>
                                    <p className="font-medium">{formatDateTime(loan.borrowed_at)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={14} className="text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Batas Kembali</p>
                                    <p className="font-medium">{formatDateTime(loan.due_date)}</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {fineAmount > 0 && (
                    <div className="mt-3 flex items-center justify-between rounded-lg bg-muted/50 p-2">
                        <div>
                            <p className="text-xs text-muted-foreground">{loan.fine ? 'Denda' : 'Estimasi Denda'}</p>
                            <p className="font-bold text-destructive">{formatCurrency(fineAmount)}</p>
                        </div>
                        {fineStatusBadge && <Badge className={fineStatusBadge.className}>{fineStatusBadge.label}</Badge>}
                    </div>
                )}

                <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => onViewDetail(loan)}>
                        <Eye size={14} className="mr-2" />
                        Detail
                    </Button>
                    {isPending && loan.can_cancel && (
                        <Button variant="destructive" size="sm" className="flex-1" onClick={() => onCancelRequest(loan)}>
                            <XCircle size={14} className="mr-2" />
                            Batalkan
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// Table Columns
function createColumns(onViewDetail: (loan: LoanDetailItem) => void, onCancelRequest: (loan: LoanDetailItem) => void): ColumnDef<LoanDetailItem>[] {
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
                <div className="max-w-[200px]">
                    <p className="truncate font-medium text-foreground">{row.original.book.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{row.original.book.author}</p>
                </div>
            ),
        },
        {
            accessorKey: 'requested_at',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
                >
                    Tgl. Permintaan
                    <ArrowUpDown size={14} className="ml-2" />
                </Button>
            ),
            cell: ({ row }) => formatDateTime(row.original.requested_at),
        },
        {
            accessorKey: 'borrowed_at',
            header: 'Tgl. Pinjam',
            cell: ({ row }) => formatDateTime(row.original.borrowed_at),
        },
        {
            accessorKey: 'due_date',
            header: 'Batas Kembali',
            cell: ({ row }) => formatDateTime(row.original.due_date),
        },
        {
            accessorKey: 'status',
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
                const loan = row.original;
                const fineAmount = loan.fine?.amount ?? (loan.is_overdue ? (loan.estimated_fine ?? 0) : 0);
                const fineStatus = loan.fine?.status ?? (loan.is_overdue ? 'unpaid' : null);

                if (fineAmount === 0) return '-';

                const fineStatusBadge = fineStatus ? getFineStatusBadge(fineStatus) : null;
                return (
                    <div className="space-y-1">
                        <p className="font-medium text-destructive">{formatCurrency(fineAmount)}</p>
                        {fineStatusBadge && <Badge className={`text-xs ${fineStatusBadge.className}`}>{fineStatusBadge.label}</Badge>}
                    </div>
                );
            },
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => {
                const loan = row.original;
                const isPending = loan.status === 'pending';

                return (
                    <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => onViewDetail(loan)}>
                            <Eye size={14} className="mr-1" />
                            Detail
                        </Button>
                        {isPending && loan.can_cancel && (
                            <Button variant="destructive" size="sm" onClick={() => onCancelRequest(loan)}>
                                <XCircle size={14} />
                            </Button>
                        )}
                    </div>
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
export default function Index({ loans, stats, filters }: PageProps) {
    const [selectedLoan, setSelectedLoan] = useState<LoanDetailItem | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [cancelLoan, setCancelLoan] = useState<LoanDetailItem | null>(null);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isSearching, setIsSearching] = useState(false);

    const handleViewDetail = (loan: LoanDetailItem) => {
        setSelectedLoan(loan);
        setIsDialogOpen(true);
    };

    const handleCancelRequest = (loan: LoanDetailItem) => {
        setCancelLoan(loan);
        setIsCancelDialogOpen(true);
    };

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        setIsSearching(true);
        router.get(
            '/loans',
            { search: searchQuery || undefined },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsSearching(false),
            },
        );
    };

    const handleConfirmCancel = (reason: string) => {
        if (!cancelLoan) return;

        setIsCancelling(true);
        router.post(
            `/loans/${cancelLoan.id}/cancel`,
            { reason },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsCancelDialogOpen(false);
                    setCancelLoan(null);
                },
                onFinish: () => {
                    setIsCancelling(false);
                },
            },
        );
    };

    const columns = createColumns(handleViewDetail, handleCancelRequest);

    return (
        <MainLayout>
            <Head title="Riwayat Peminjaman" />

            <div className="flex flex-col gap-6 pb-8">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="h-8 w-1.5 rounded-full bg-primary" />
                    <div>
                        <h1 className="text-xl font-bold text-foreground md:text-2xl">RIWAYAT PEMINJAMAN</h1>
                        <p className="text-sm text-muted-foreground">Lihat semua riwayat peminjaman buku Anda</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                    <StatsCard
                        icon={BookOpen}
                        label="Total Pinjaman"
                        value={stats.totalLoans}
                        
                    />
                    <StatsCard
                        icon={Hourglass}
                        label="Menunggu"
                        value={stats.pendingLoans}
                        
                    />
                    <StatsCard
                        icon={Clock}
                        label="Dipinjam"
                        value={stats.activeLoans}
                        
                    />
                    <StatsCard
                        icon={Calendar}
                        label="Terlambat"
                        value={stats.overdueLoans}
                        
                    />
                    <StatsCard
                        icon={BookOpen}
                        label="Total Denda"
                        value={formatCurrency(stats.totalFines)}
                        className="col-span-2 lg:col-span-1"
                    />
                </div>

                {/* Mobile Search - Only visible on mobile */}
                <div className="lg:hidden">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input
                            placeholder="Cari judul buku atau penulis..."
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
                    {loans.data.length === 0 ? (
                        <Card className="py-16 text-center">
                            <CardContent>
                                <BookOpen size={48} className="text-muted-foreground" />
                                <h3 className="text-lg font-semibold text-foreground">Belum Ada Peminjaman</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {filters.search
                                        ? 'Tidak ada peminjaman yang sesuai dengan pencarian.'
                                        : 'Anda belum memiliki riwayat peminjaman buku.'}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        loans.data.map((loan) => (
                            <LoanCard key={loan.id} loan={loan} onViewDetail={handleViewDetail} onCancelRequest={handleCancelRequest} />
                        ))
                    )}
                </div>

                {/* Mobile Pagination */}
                {loans.last_page > 1 && (
                    <div className="flex flex-col gap-3 lg:hidden">
                        <div className="text-center text-sm text-muted-foreground">
                            Halaman {loans.current_page} dari {loans.last_page}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    setIsSearching(true);
                                    router.get(
                                        loans.prev_page_url || '/loans',
                                        { search: searchQuery || undefined },
                                        {
                                            preserveState: true,
                                            preserveScroll: true,
                                            onFinish: () => setIsSearching(false),
                                        },
                                    );
                                }}
                                disabled={!loans.prev_page_url || isSearching}
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
                                        loans.next_page_url || '/loans',
                                        { search: searchQuery || undefined },
                                        {
                                            preserveState: true,
                                            preserveScroll: true,
                                            onFinish: () => setIsSearching(false),
                                        },
                                    );
                                }}
                                disabled={!loans.next_page_url || isSearching}
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
                        data={loans}
                        searchPlaceholder="Cari judul buku atau penulis..."
                        searchValue={filters.search}
                        routePath="/loans"
                    />
                </div>
            </div>

            {/* Loan Detail Dialog */}
            <LoanDetailDialog loan={selectedLoan} open={isDialogOpen} onOpenChange={setIsDialogOpen} onCancelRequest={handleCancelRequest} />

            {/* Cancel Loan Dialog */}
            <CancelLoanDialog
                loan={cancelLoan}
                open={isCancelDialogOpen}
                onOpenChange={setIsCancelDialogOpen}
                onConfirm={handleConfirmCancel}
                isLoading={isCancelling}
            />
        </MainLayout>
    );
}
