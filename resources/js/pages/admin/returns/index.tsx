import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ServerTable } from '@/components/ui/server-table';
import AdminLayout from '@/layouts/admin/admin-layout';
import { formatDateTime } from '@/lib/utils';
import type { PaginatedData } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { BookOpen, CheckCircle2, Clock, Eye, RotateCcw, XCircle } from 'lucide-react';

interface BookReturn {
    id: number;
    student: {
        id: number;
        name: string;
        nis: string;
    };
    book: {
        id: number;
        title: string;
        code: string;
        cover: string | null;
    };
    borrowed_at: string;
    due_date: string;
    returned_at: string;
    status: 'on_time' | 'late';
    late_days: number;
    fine_amount: number;
    fine_status: 'no_fine' | 'unpaid' | 'paid';
}

interface ReturnsIndexProps {
    returns: PaginatedData<BookReturn>;
    stats: {
        total_returns: number;
        on_time_returns: number;
        late_returns: number;
        pending_fines: number;
    };
    filters: {
        search?: string;
    };
}

// Remove local formatDate, using centralized formatDateTime from utils

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

export default function ReturnsIndex({ returns, stats, filters }: ReturnsIndexProps) {
    const columns: ColumnDef<BookReturn>[] = [
        {
            id: 'no',
            header: 'No',
            cell: ({ row }) => <span className="font-medium">{row.index + 1}.</span>,
        },
        {
            id: 'cover',
            header: 'Cover',
            cell: ({ row }) => {
                const cover = row.original.book.cover;
                return cover ? (
                    <img src={cover} alt={row.original.book.title} className="shadow-soft h-14 w-10 rounded-lg object-cover" />
                ) : (
                    <BookOpen size={20} className="text-muted-foreground" />
                );
            },
        },
        {
            id: 'title',
            header: 'Judul Seri',
            cell: ({ row }) => (
                <div className="max-w-sm">
                    <p className="font-medium text-wrap text-foreground">{row.original.book.title}</p>
                    <p className="text-xs text-wrap text-muted-foreground">{row.original.book.code}</p>
                </div>
            ),
        },
        {
            id: 'student',
            header: 'Peminjam',
            cell: ({ row }) => {
                const { student } = row.original;
                return (
                    <div>
                        <p className="font-medium text-foreground">{student.name}</p>
                        <p className="text-xs text-muted-foreground">NIS: {student.nis}</p>
                    </div>
                );
            },
        },
        {
            accessorKey: 'borrowed_at',
            header: 'Tgl Pinjam',
            cell: ({ row }) => (
                <div className="text-sm">
                    <span className="text-foreground">{formatDateTime(row.original.borrowed_at)}</span>
                </div>
            ),
        },
        {
            accessorKey: 'returned_at',
            header: 'Tgl Kembali',
            cell: ({ row }) => (
                <div className="text-sm">
                    <span className="text-foreground">{formatDateTime(row.original.returned_at)}</span>
                </div>
            ),
        },
        {
            id: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const { status, late_days } = row.original;
                if (status === 'on_time') {
                    return (
                        <Badge variant="success" className="gap-1">
                            <CheckCircle2 size={12} />
                            Tepat Waktu
                        </Badge>
                    );
                }
                return (
                    <Badge variant="destructive" className="gap-1">
                        <XCircle size={12} />
                        Terlambat {late_days} hari
                    </Badge>
                );
            },
        },
        {
            id: 'fine',
            header: 'Denda',
            cell: ({ row }) => {
                const { fine_amount, fine_status } = row.original;
                if (fine_status === 'no_fine') {
                    return <span className="text-sm text-muted-foreground">-</span>;
                }
                return (
                    <div className="space-y-1">
                        <p className="font-semibold text-destructive">{formatCurrency(fine_amount)}</p>
                        {fine_status === 'paid' ? (
                            <Badge variant="success" className="text-xs">
                                Lunas
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="border-warning text-xs text-warning">
                                Belum Bayar
                            </Badge>
                        )}
                    </div>
                );
            },
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => {
                const returnData = row.original;
                return (
                    <Button
                        variant="ghost"
                        size="xs"
                        className="text-primary hover:bg-primary/10"
                        onClick={() => router.visit(`/admin/returns/${returnData.id}`)}
                    >
                        <Eye size={12} />
                        Detail
                    </Button>
                );
            },
        },
    ];

    return (
        <AdminLayout>
            <Head title="Data Pengembalian" />

            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Data Pengembalian</h1>
                    <p className="mt-1 text-muted-foreground">Riwayat pengembalian buku oleh siswa</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <Card className="shadow-sm border border-border">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <RotateCcw size={20} className="text-primary" />
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{stats.total_returns}</p>
                                    <p className="text-xs text-muted-foreground">Total Pengembalian</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border border-border">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 size={20} className="text-emerald-600" />
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{stats.on_time_returns}</p>
                                    <p className="text-xs text-muted-foreground">Tepat Waktu</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border border-border">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <Clock size={20} className="text-amber-600" />
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{stats.late_returns}</p>
                                    <p className="text-xs text-muted-foreground">Terlambat</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border border-border">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <XCircle size={20} className="text-red-600" />
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{stats.pending_fines}</p>
                                    <p className="text-xs text-muted-foreground">Denda Belum Lunas</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Data Table */}
                <ServerTable
                    columns={columns}
                    data={returns}
                    searchPlaceholder="Cari pengembalian (nama siswa, NIS, judul buku)..."
                    searchValue={filters.search}
                    routePath="/admin/returns"
                />
            </div>
        </AdminLayout>
    );
}
