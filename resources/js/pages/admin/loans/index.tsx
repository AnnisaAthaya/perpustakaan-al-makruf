import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ServerTable } from '@/components/ui/server-table';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin/admin-layout';
import { formatDateTime } from '@/lib/utils';
import type { PaginatedData } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { AlertTriangle, BookOpen, Check, CheckCircle, Clock, Eye, Hourglass, Package, RotateCcw, Users, X } from 'lucide-react';
import { useState } from 'react';

interface Loan {
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
    // Pending loans
    requested_at?: string;
    // Active loans
    borrowed_at?: string;
    due_date?: string;
    status: 'pending' | 'active' | 'overdue';
    days_remaining?: number;
    overdue_days?: number;
    estimated_fine?: number;
}

interface LoansIndexProps {
    loans: PaginatedData<Loan>;
    stats: {
        pending_loans: number;
        active_loans: number;
        overdue_loans: number;
        total_borrowers: number;
    };
    filters: {
        search?: string;
    };
}

// Remove local formatDate, now using centralized formatDateTime from utils

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

export default function LoansIndex({ loans, stats, filters }: LoansIndexProps) {
    // Return dialog state
    const [returnDialogOpen, setReturnDialogOpen] = useState(false);
    const [loanToReturn, setLoanToReturn] = useState<Loan | null>(null);
    const [isProcessingReturn, setIsProcessingReturn] = useState(false);
    const [adjustedAmount, setAdjustedAmount] = useState<string>('');
    const [adjustmentReason, setAdjustmentReason] = useState<string>('');
    const [returnErrors, setReturnErrors] = useState<{ adjusted_amount?: string; adjustment_reason?: string }>({});

    // Approve dialog state
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [loanToApprove, setLoanToApprove] = useState<Loan | null>(null);
    const [isProcessingApprove, setIsProcessingApprove] = useState(false);

    // Reject dialog state
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [loanToReject, setLoanToReject] = useState<Loan | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [isProcessingReject, setIsProcessingReject] = useState(false);

    // Return handlers
    const handleReturnClick = (loan: Loan) => {
        setLoanToReturn(loan);
        setAdjustedAmount('');
        setAdjustmentReason('');
        setReturnErrors({});
        setReturnDialogOpen(true);
    };

    const handleReturnConfirm = () => {
        if (!loanToReturn) return;

        setIsProcessingReturn(true);
        setReturnErrors({});

        const data: { adjusted_amount?: number; adjustment_reason?: string } = {};

        if (adjustedAmount !== '') {
            data.adjusted_amount = parseFloat(adjustedAmount);
        }

        if (adjustmentReason !== '') {
            data.adjustment_reason = adjustmentReason;
        }

        router.post(`/admin/loans/${loanToReturn.id}/return`, data, {
            onSuccess: () => {
                setReturnDialogOpen(false);
                setLoanToReturn(null);
                setAdjustedAmount('');
                setAdjustmentReason('');
            },
            onError: (err) => {
                setReturnErrors(err as { adjusted_amount?: string; adjustment_reason?: string });
            },
            onFinish: () => {
                setIsProcessingReturn(false);
            },
        });
    };

    // Approve handlers
    const handleApproveClick = (loan: Loan) => {
        setLoanToApprove(loan);
        setApproveDialogOpen(true);
    };

    const handleApproveConfirm = () => {
        if (!loanToApprove) return;

        setIsProcessingApprove(true);
        router.post(
            `/admin/loans/${loanToApprove.id}/approve`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setApproveDialogOpen(false);
                    setLoanToApprove(null);
                },
                onFinish: () => {
                    setIsProcessingApprove(false);
                },
            },
        );
    };

    // Reject handlers
    const handleRejectClick = (loan: Loan) => {
        setLoanToReject(loan);
        setRejectReason('');
        setRejectDialogOpen(true);
    };

    const handleRejectConfirm = () => {
        if (!loanToReject) return;

        setIsProcessingReject(true);
        router.post(
            `/admin/loans/${loanToReject.id}/reject`,
            { reason: rejectReason || null },
            {
                onSuccess: () => {
                    setRejectDialogOpen(false);
                    setLoanToReject(null);
                    setRejectReason('');
                },
                onFinish: () => {
                    setIsProcessingReject(false);
                },
            },
        );
    };

    // Unified columns for all loans (pending + active)
    const columns: ColumnDef<Loan>[] = [
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
            id: 'book',
            header: 'Buku',
            cell: ({ row }) => {
                const { book } = row.original;
                return (
                    <div className="flex max-w-sm items-center gap-3">
                        {book.cover ? (
                            <img src={book.cover} alt={book.title} className="shadow-soft h-12 w-9 rounded-lg object-cover" />
                        ) : (
                            <BookOpen size={14} className="text-muted-foreground" />
                        )}
                        <div>
                            <p className="line-clamp-1 font-medium text-foreground">{book.title}</p>
                            <p className="text-xs text-muted-foreground">{book.code}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            id: 'date',
            header: 'Tanggal',
            cell: ({ row }) => {
                const { status, requested_at, borrowed_at } = row.original;
                if (status === 'pending') {
                    return (
                        <div>
                            <p className="text-xs text-muted-foreground">Diminta:</p>
                            <p className="text-sm font-medium">{formatDateTime(requested_at)}</p>
                        </div>
                    );
                }
                return (
                    <div>
                        <p className="text-xs text-muted-foreground">Dipinjam:</p>
                        <p className="text-sm font-medium">{formatDateTime(borrowed_at)}</p>
                    </div>
                );
            },
        },
        {
            id: 'due_date',
            header: 'Jatuh Tempo',
            cell: ({ row }) => {
                const { status, due_date } = row.original;
                if (status === 'pending') {
                    return <span className="text-sm text-muted-foreground">-</span>;
                }
                return <span className="text-sm">{formatDateTime(due_date)}</span>;
            },
        },
        {
            id: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const { status, days_remaining, overdue_days } = row.original;

                if (status === 'pending') {
                    return (
                        <Badge variant="warning" className="gap-1">
                            <Hourglass size={12} />
                            Menunggu
                        </Badge>
                    );
                }

                if (status === 'active') {
                    return (
                        <Badge variant="success" className="gap-1">
                            <Clock size={12} />
                            {days_remaining} hari lagi
                        </Badge>
                    );
                }

                return (
                    <Badge variant="destructive" className="gap-1">
                        <AlertTriangle size={12} />
                        Terlambat {overdue_days} hari
                    </Badge>
                );
            },
        },
        {
            id: 'fine',
            header: 'Est. Denda',
            cell: ({ row }) => {
                const { status, estimated_fine } = row.original;
                if (status === 'pending' || status === 'active') {
                    return <span className="text-sm text-muted-foreground">-</span>;
                }
                return <span className="font-semibold text-destructive">{formatCurrency(estimated_fine || 0)}</span>;
            },
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => {
                const loan = row.original;
                const { status } = loan;

                if (status === 'pending') {
                    return (
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="xs"
                                className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                onClick={() => handleApproveClick(loan)}
                            >
                                <Check size={12} />
                                Setujui
                            </Button>
                            <Button
                                variant="ghost"
                                size="xs"
                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={() => handleRejectClick(loan)}
                            >
                                <X size={12} />
                                Tolak
                            </Button>
                        </div>
                    );
                }

                return (
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="xs"
                            className="text-primary hover:bg-primary/10"
                            onClick={() => router.visit(`/admin/loans/${loan.id}`)}
                        >
                            <Eye size={12} />
                            Detail
                        </Button>
                        <Button
                            variant="ghost"
                            size="xs"
                            className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                            onClick={() => handleReturnClick(loan)}
                        >
                            <RotateCcw size={12} />
                            Kembalikan
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <AdminLayout>
            <Head title="Data Peminjaman" />

            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Data Peminjaman</h1>
                    <p className="mt-1 text-muted-foreground">Kelola permintaan dan peminjaman buku</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <Card className="shadow-sm border border-border">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <Hourglass size={20} className="text-amber-600" />
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{stats.pending_loans}</p>
                                    <p className="text-xs text-muted-foreground">Permintaan Baru</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border border-border">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <Package size={20} className="text-blue-600" />
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{stats.active_loans}</p>
                                    <p className="text-xs text-muted-foreground">Sedang Dipinjam</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border border-border">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <AlertTriangle size={20} className="text-red-600" />
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{stats.overdue_loans}</p>
                                    <p className="text-xs text-muted-foreground">Terlambat</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border border-border">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <Users size={20} className="text-violet-600" />
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{stats.total_borrowers}</p>
                                    <p className="text-xs text-muted-foreground">Peminjam Aktif</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Data Table */}
                <Card>
                    <CardContent className="p-6">
                        <ServerTable
                            columns={columns}
                            data={loans}
                            searchPlaceholder="Cari peminjaman (nama siswa, NIS, judul buku)..."
                            searchValue={filters.search}
                            routePath="/admin/loans"
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Return Confirmation Dialog */}
            <AlertDialog
                open={returnDialogOpen}
                onOpenChange={(open) => {
                    // Don't allow closing dialog while processing
                    if (!isProcessingReturn) {
                        setReturnDialogOpen(open);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <CheckCircle className="size-7 text-primary" />
                        <AlertDialogTitle>Proses Pengembalian?</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-4">
                                <p>
                                    Anda akan memproses pengembalian buku{' '}
                                    <span className="font-semibold text-foreground">"{loanToReturn?.book.title}"</span> dari{' '}
                                    <span className="font-semibold text-foreground">{loanToReturn?.student.name}</span>.
                                </p>
                                {loanToReturn?.status === 'overdue' && (
                                    <>
                                        <div className="rounded-lg bg-destructive/10 p-3">
                                            <p className="text-sm font-medium text-destructive">Keterlambatan: {loanToReturn.overdue_days} hari</p>
                                            <p className="text-sm text-destructive">
                                                Denda Otomatis: {formatCurrency(loanToReturn.estimated_fine || 0)}
                                            </p>
                                        </div>

                                        <div className="space-y-3 rounded-lg border border-border bg-muted/50 p-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="adjusted_amount_list" className="text-sm font-medium">
                                                    Edit Denda (Opsional)
                                                </Label>
                                                <Input
                                                    id="adjusted_amount_list"
                                                    type="number"
                                                    placeholder={(loanToReturn.estimated_fine || 0).toString()}
                                                    value={adjustedAmount}
                                                    onChange={(e) => setAdjustedAmount(e.target.value)}
                                                    min={0}
                                                    max={100000}
                                                    step={1000}
                                                    className="bg-background"
                                                />
                                                {returnErrors.adjusted_amount && (
                                                    <p className="text-xs text-destructive">{returnErrors.adjusted_amount}</p>
                                                )}
                                                <p className="text-xs text-muted-foreground">Min: Rp 0, Max: Rp 100.000</p>
                                            </div>

                                            {adjustedAmount !== '' && parseFloat(adjustedAmount) !== (loanToReturn.estimated_fine || 0) && (
                                                <div className="space-y-2">
                                                    <Label htmlFor="adjustment_reason_list" className="text-sm font-medium">
                                                        Alasan Perubahan <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Textarea
                                                        id="adjustment_reason_list"
                                                        placeholder="Contoh: Siswa sakit dengan surat dokter, 2 hari adalah hari libur nasional..."
                                                        value={adjustmentReason}
                                                        onChange={(e) => setAdjustmentReason(e.target.value)}
                                                        minLength={10}
                                                        maxLength={500}
                                                        rows={3}
                                                        className="resize-none bg-background"
                                                    />
                                                    {returnErrors.adjustment_reason && (
                                                        <p className="text-xs text-destructive">{returnErrors.adjustment_reason}</p>
                                                    )}
                                                    <p className="text-xs text-muted-foreground">{adjustmentReason.length}/500 karakter (min: 10)</p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessingReturn}>Batal</AlertDialogCancel>
                        <Button onClick={handleReturnConfirm} disabled={isProcessingReturn} className="gap-2">
                            <RotateCcw size={16} />
                            {isProcessingReturn ? 'Memproses...' : 'Ya, Proses Pengembalian'}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Approve Confirmation Dialog */}
            <AlertDialog
                open={approveDialogOpen}
                onOpenChange={(open) => {
                    // Don't allow closing dialog while processing
                    if (!isProcessingApprove) {
                        setApproveDialogOpen(open);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <Check className="size-7 text-emerald-600" />
                        <AlertDialogTitle>Setujui Peminjaman?</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-3">
                                <p>
                                    Anda akan menyetujui permintaan peminjaman buku{' '}
                                    <span className="font-semibold text-foreground">"{loanToApprove?.book.title}"</span> oleh{' '}
                                    <span className="font-semibold text-foreground">{loanToApprove?.student.name}</span>.
                                </p>
                                <div className="rounded-lg bg-emerald-50 p-3">
                                    <p className="text-sm text-emerald-700">
                                        Setelah disetujui, siswa dapat mengambil buku di perpustakaan dan periode peminjaman akan dimulai.
                                    </p>
                                </div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessingApprove}>Batal</AlertDialogCancel>
                        <Button onClick={handleApproveConfirm} disabled={isProcessingApprove} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                            <Check size={16} />
                            {isProcessingApprove ? 'Memproses...' : 'Ya, Setujui'}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reject Confirmation Dialog */}
            <AlertDialog
                open={rejectDialogOpen}
                onOpenChange={(open) => {
                    // Don't allow closing dialog while processing
                    if (!isProcessingReject) {
                        setRejectDialogOpen(open);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <X className="size-7 text-red-600" />
                        <AlertDialogTitle>Tolak Peminjaman?</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-3">
                                <p>
                                    Anda akan menolak permintaan peminjaman buku{' '}
                                    <span className="font-semibold text-foreground">"{loanToReject?.book.title}"</span> oleh{' '}
                                    <span className="font-semibold text-foreground">{loanToReject?.student.name}</span>.
                                </p>
                                <div className="space-y-2">
                                    <Label htmlFor="reject-reason">Alasan Penolakan (Opsional)</Label>
                                    <Textarea
                                        id="reject-reason"
                                        placeholder="Contoh: Stok buku habis, buku sedang diperbaiki, dll."
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessingReject}>Batal</AlertDialogCancel>
                        <Button onClick={handleRejectConfirm} disabled={isProcessingReject} className="gap-2 bg-red-600 hover:bg-red-700">
                            <X size={16} />
                            {isProcessingReject ? 'Memproses...' : 'Ya, Tolak'}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}
