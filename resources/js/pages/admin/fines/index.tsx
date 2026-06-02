import {
    AlertDialog,
    AlertDialogAction,
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
import { ServerTable } from '@/components/ui/server-table';
import AdminLayout from '@/layouts/admin/admin-layout';
import { formatDateTime } from '@/lib/utils';
import type { PaginatedData } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { AlertCircle, Banknote, CheckCircle, Clock, Eye, Image, XCircle } from 'lucide-react';
import { useState } from 'react';

interface Fine {
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
    };
    borrowed_at: string;
    returned_at: string;
    late_days: number;
    amount: number;
    status: 'unpaid' | 'pending_verification' | 'paid';
    payment_proof: string | null;
    submitted_at: string | null;
}

interface FinesIndexProps {
    fines: PaginatedData<Fine>;
    stats: {
        total_fines: number;
        pending_verification: number;
        unpaid: number;
        paid: number;
        total_amount: number;
        pending_amount: number;
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

export default function FinesIndex({ fines, stats, filters }: FinesIndexProps) {
    const [proofDialogOpen, setProofDialogOpen] = useState(false);
    const [selectedFine, setSelectedFine] = useState<Fine | null>(null);
    const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleViewProof = (fine: Fine) => {
        setSelectedFine(fine);
        setProofDialogOpen(true);
    };

    const handleVerifyClick = (fine: Fine) => {
        setSelectedFine(fine);
        setVerifyDialogOpen(true);
    };

    const handleRejectClick = (fine: Fine) => {
        setSelectedFine(fine);
        setRejectDialogOpen(true);
    };

    const handleVerifyConfirm = () => {
        if (!selectedFine) return;

        setIsProcessing(true);
        router.post(
            `/admin/fines/${selectedFine.id}/verify`,
            {},
            {
                onSuccess: () => {
                    setVerifyDialogOpen(false);
                    setSelectedFine(null);
                },
                onFinish: () => {
                    setIsProcessing(false);
                },
            },
        );
    };

    const handleRejectConfirm = () => {
        if (!selectedFine) return;

        setIsProcessing(true);
        router.post(
            `/admin/fines/${selectedFine.id}/reject`,
            {},
            {
                onSuccess: () => {
                    setRejectDialogOpen(false);
                    setSelectedFine(null);
                },
                onFinish: () => {
                    setIsProcessing(false);
                },
            },
        );
    };

    const getStatusBadge = (status: Fine['status']) => {
        switch (status) {
            case 'paid':
                return (
                    <Badge variant="success" className="gap-1">
                        <CheckCircle size={12} />
                        Lunas
                    </Badge>
                );
            case 'pending_verification':
                return (
                    <Badge variant="warning" className="gap-1">
                        <Clock size={12} />
                        Menunggu Verifikasi
                    </Badge>
                );
            case 'unpaid':
            default:
                return (
                    <Badge variant="destructive" className="gap-1">
                        <AlertCircle size={12} />
                        Belum Bayar
                    </Badge>
                );
        }
    };

    const columns: ColumnDef<Fine>[] = [
        {
            id: 'student',
            header: 'Siswa',
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
                    <div className="max-w-sm">
                        <p className="font-medium text-wrap text-foreground">{book.title}</p>
                        <p className="text-xs text-wrap text-muted-foreground">{book.code}</p>
                    </div>
                );
            },
        },
        {
            accessorKey: 'late_days',
            header: 'Keterlambatan',
            cell: ({ row }) => <span className="font-medium text-destructive">{row.original.late_days} hari</span>,
        },
        {
            accessorKey: 'amount',
            header: 'Denda',
            cell: ({ row }) => <span className="font-semibold text-foreground">{formatCurrency(row.original.amount)}</span>,
        },
        {
            id: 'status',
            header: 'Status',
            cell: ({ row }) => getStatusBadge(row.original.status),
        },
        {
            id: 'proof',
            header: 'Bukti',
            cell: ({ row }) => {
                const fine = row.original;
                if (!fine.payment_proof) {
                    return <span className="text-sm text-muted-foreground">-</span>;
                }
                return (
                    <Button variant="ghost" size="icon-sm" className="text-primary hover:bg-primary/10" onClick={() => handleViewProof(fine)}>
                        <Image size={16} />
                    </Button>
                );
            },
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => {
                const fine = row.original;

                if (fine.status === 'paid') {
                    return <span className="text-sm text-muted-foreground">-</span>;
                }

                if (fine.status === 'pending_verification') {
                    return (
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="xs"
                                className="text-primary hover:bg-primary/10"
                                onClick={() => router.visit(`/admin/fines/${fine.id}`)}
                            >
                                <Eye size={12} />
                                Detail
                            </Button>
                            <Button
                                variant="ghost"
                                size="xs"
                                className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                onClick={() => handleVerifyClick(fine)}
                            >
                                <CheckCircle size={12} />
                                Verifikasi
                            </Button>
                            <Button
                                variant="ghost"
                                size="xs"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => handleRejectClick(fine)}
                            >
                                <XCircle size={12} />
                                Tolak
                            </Button>
                        </div>
                    );
                }

                return (
                    <Button
                        variant="ghost"
                        size="xs"
                        className="text-primary hover:bg-primary/10"
                        onClick={() => router.visit(`/admin/fines/${fine.id}`)}
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
            <Head title="Verifikasi Denda" />

            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Verifikasi Denda</h1>
                    <p className="mt-1 text-muted-foreground">Kelola dan verifikasi pembayaran denda siswa</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <Card className="shadow-sm border border-border">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <Clock size={20} className="text-amber-600" />
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{stats.pending_verification}</p>
                                    <p className="text-xs text-muted-foreground">Perlu Verifikasi</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border border-border">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <AlertCircle size={20} className="text-red-600" />
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{stats.unpaid}</p>
                                    <p className="text-xs text-muted-foreground">Belum Bayar</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border border-border">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle size={20} className="text-emerald-600" />
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{stats.paid}</p>
                                    <p className="text-xs text-muted-foreground">Sudah Lunas</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border border-border">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <Banknote size={20} className="text-primary" />
                                <div>
                                    <p className="text-lg font-bold text-foreground">{formatCurrency(stats.pending_amount)}</p>
                                    <p className="text-xs text-muted-foreground">Belum Terbayar</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Data Table */}
                <ServerTable
                    columns={columns}
                    data={fines}
                    searchPlaceholder="Cari denda (nama siswa, NIS, judul buku)..."
                    searchValue={filters.search}
                    routePath="/admin/fines"
                />
            </div>

            {/* View Payment Proof Dialog */}
            <AlertDialog open={proofDialogOpen} onOpenChange={setProofDialogOpen}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bukti Pembayaran</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bukti pembayaran dari <span className="font-semibold text-foreground">{selectedFine?.student.name}</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        {selectedFine?.payment_proof && (
                            <img
                                src={selectedFine.payment_proof}
                                alt="Bukti pembayaran"
                                className="w-full rounded-xl border border-border object-contain"
                            />
                        )}
                        <div className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Nominal Denda:</span>
                                <span className="font-semibold">{formatCurrency(selectedFine?.amount || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Dikirim pada:</span>
                                <span>{selectedFine?.submitted_at ? formatDateTime(selectedFine.submitted_at) : '-'}</span>
                            </div>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Tutup</AlertDialogCancel>
                        {selectedFine?.status === 'pending_verification' && (
                            <>
                                <AlertDialogAction
                                    onClick={() => {
                                        setProofDialogOpen(false);
                                        handleVerifyClick(selectedFine);
                                    }}
                                    className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <CheckCircle size={16} />
                                    Verifikasi
                                </AlertDialogAction>
                            </>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Verify Confirmation Dialog */}
            <AlertDialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <CheckCircle className="size-7 text-emerald-600" />
                        <AlertDialogTitle>Verifikasi Pembayaran?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Anda akan memverifikasi pembayaran denda sebesar{' '}
                            <span className="font-semibold text-foreground">{formatCurrency(selectedFine?.amount || 0)}</span> dari{' '}
                            <span className="font-semibold text-foreground">{selectedFine?.student.name}</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessing}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleVerifyConfirm}
                            disabled={isProcessing}
                            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                        >
                            <CheckCircle size={16} />
                            {isProcessing ? 'Memproses...' : 'Ya, Verifikasi'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reject Confirmation Dialog */}
            <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <XCircle className="size-7 text-destructive" />
                        <AlertDialogTitle>Tolak Bukti Pembayaran?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Anda akan menolak bukti pembayaran dari{' '}
                            <span className="font-semibold text-foreground">{selectedFine?.student.name}</span>. Siswa akan diminta untuk mengunggah
                            bukti pembayaran yang baru.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessing}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRejectConfirm}
                            disabled={isProcessing}
                            className="gap-2 bg-destructive hover:bg-destructive/90"
                        >
                            <XCircle size={16} />
                            {isProcessing ? 'Memproses...' : 'Ya, Tolak'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}
