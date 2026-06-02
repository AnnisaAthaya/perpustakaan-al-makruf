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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin/admin-layout';
import { formatDateTimeLong } from '@/lib/utils';
import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, BookOpen, Calendar, CheckCircle, Clock, CreditCard, RotateCcw, User, XCircle } from 'lucide-react';
import { useState } from 'react';

interface Loan {
    id: number;
    student: {
        id: number;
        name: string;
        nis: string;
        email: string;
    };
    book: {
        id: number;
        title: string;
        code: string;
        publisher: string;
        cover: string | null;
    };
    borrowed_at: string | null;
    due_date: string | null;
    requested_at: string | null;
    status: 'pending' | 'active' | 'overdue' | 'rejected' | 'returned' | 'cancelled';
    days_remaining: number;
    overdue_days: number;
    estimated_fine: number;
    notes: string | null;
    rejection_reason: string | null;
}

interface ShowLoanProps {
    loan: Loan;
}

// Remove local formatDate, now using centralized formatDateTimeLong from utils

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

export default function ShowLoan({ loan }: ShowLoanProps) {
    const [returnDialogOpen, setReturnDialogOpen] = useState(false);
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [adjustedAmount, setAdjustedAmount] = useState<string>('');
    const [adjustmentReason, setAdjustmentReason] = useState<string>('');
    const [rejectionReason, setRejectionReason] = useState<string>('');
    const [errors, setErrors] = useState<{ adjusted_amount?: string; adjustment_reason?: string; rejection_reason?: string }>({});

    const { student, book } = loan;

    const originalAmount = loan.estimated_fine || 0;
    const isAmountChanged = adjustedAmount !== '' && parseFloat(adjustedAmount) !== originalAmount;

    const handleApprove = () => {
        setIsProcessing(true);
        router.post(
            `/admin/loans/${loan.id}/approve`,
            {},
            {
                onSuccess: () => {
                    setApproveDialogOpen(false);
                },
                onFinish: () => {
                    setIsProcessing(false);
                },
            },
        );
    };

    const handleReject = () => {
        setIsProcessing(true);
        setErrors({});
        router.post(
            `/admin/loans/${loan.id}/reject`,
            { rejection_reason: rejectionReason },
            {
                onSuccess: () => {
                    setRejectDialogOpen(false);
                    setRejectionReason('');
                },
                onError: (err) => {
                    setErrors(err as { rejection_reason?: string });
                },
                onFinish: () => {
                    setIsProcessing(false);
                },
            },
        );
    };

    const handleReturnConfirm = () => {
        setIsProcessing(true);
        setErrors({});

        const data: { adjusted_amount?: number; adjustment_reason?: string } = {};

        if (adjustedAmount !== '') {
            data.adjusted_amount = parseFloat(adjustedAmount);
        }

        if (adjustmentReason !== '') {
            data.adjustment_reason = adjustmentReason;
        }

        router.post(`/admin/loans/${loan.id}/return`, data, {
            onSuccess: () => {
                setReturnDialogOpen(false);
                setAdjustedAmount('');
                setAdjustmentReason('');
            },
            onError: (err) => {
                setErrors(err as { adjusted_amount?: string; adjustment_reason?: string });
            },
            onFinish: () => {
                setIsProcessing(false);
            },
        });
    };

    return (
        <AdminLayout>
            <Head title={`Detail Peminjaman - ${book.title}`} />

            <div className="mx-auto max-w-4xl space-y-6">
                {/* Page Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/loans"
                            className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Detail Peminjaman</h1>
                            <p className="mt-0.5 text-muted-foreground">ID Transaksi: #{loan.id}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {loan.status === 'pending' ? (
                            <Badge variant="warning" className="gap-1 px-3 py-1.5 text-sm">
                                <Clock size={14} />
                                Menunggu Persetujuan
                            </Badge>
                        ) : loan.status === 'active' ? (
                            <Badge variant="success" className="gap-1 px-3 py-1.5 text-sm">
                                <Clock size={14} />
                                {loan.days_remaining} Hari Lagi
                            </Badge>
                        ) : loan.status === 'overdue' ? (
                            <Badge variant="destructive" className="gap-1 px-3 py-1.5 text-sm">
                                <AlertTriangle size={14} />
                                Terlambat {loan.overdue_days} Hari
                            </Badge>
                        ) : loan.status === 'rejected' ? (
                            <Badge variant="destructive" className="gap-1 px-3 py-1.5 text-sm">
                                <XCircle size={14} />
                                Ditolak
                            </Badge>
                        ) : null}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content - Left Side */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Book Info Card */}
                        <Card>
                            <CardHeader className="border-b border-border pb-4">
                                <div className="flex items-center gap-3">
                                    <BookOpen className="size-7 shrink-0 text-primary" />
                                    <div>
                                        <CardTitle className="text-base">Informasi Buku</CardTitle>
                                        <CardDescription>Detail buku yang dipinjam</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="flex gap-4">
                                    {book.cover ? (
                                        <img src={book.cover} alt={book.title} className="shadow-soft-md h-32 w-24 rounded-xl object-cover" />
                                    ) : (
                                        <BookOpen size={32} className="text-muted-foreground" />
                                    )}
                                    <div className="flex-1 space-y-2">
                                        <h3 className="text-lg font-semibold text-foreground">{book.title}</h3>
                                        <div className="space-y-1 text-sm">
                                            <p>
                                                <span className="text-muted-foreground">Kode Buku:</span>{' '}
                                                <span className="font-medium">{book.code}</span>
                                            </p>
                                            <p>
                                                <span className="text-muted-foreground">Penerbit:</span>{' '}
                                                <span className="font-medium">{book.publisher}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Student Info Card */}
                        <Card>
                            <CardHeader className="border-b border-border pb-4">
                                <div className="flex items-center gap-3">
                                    <User className="size-5 text-secondary-foreground" />
                                    <div>
                                        <CardTitle className="text-base">Informasi Peminjam</CardTitle>
                                        <CardDescription>Data siswa yang meminjam</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Nama Lengkap</p>
                                        <p className="font-semibold text-foreground">{student.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">NIS</p>
                                        <p className="font-semibold text-foreground">{student.nis}</p>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-semibold text-foreground">{student.email}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes Card (if any) */}
                        {loan.notes && (
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Catatan</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{loan.notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar - Right Side */}
                    <div className="space-y-6">
                        {/* Timeline Card */}
                        <Card>
                            <CardHeader className="border-b border-border pb-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="size-7 shrink-0 text-primary" />
                                    <CardTitle className="text-base">Timeline</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="space-y-4">
                                    {loan.status === 'pending' ? (
                                        // Pending Status - Show Requested Date
                                        <div className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <Clock size={14} className="text-warning" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-foreground">Diajukan</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {loan.requested_at ? formatDateTimeLong(loan.requested_at) : '-'}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        // Active/Overdue/Returned Status - Show Full Timeline
                                        <>
                                            {/* Borrowed Date */}
                                            <div className="flex gap-3">
                                                <div className="flex flex-col items-center">
                                                    <BookOpen size={14} className="text-primary" />
                                                    <div className="mt-1 h-full w-0.5 bg-border" />
                                                </div>
                                                <div className="flex-1 pb-4">
                                                    <p className="text-sm font-medium text-foreground">Dipinjam</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {loan.borrowed_at ? formatDateTimeLong(loan.borrowed_at) : '-'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Due Date */}
                                            <div className="flex gap-3">
                                                <div className="flex flex-col items-center">
                                                    <Clock
                                                            size={14}
                                                            className={loan.status === 'overdue' ? 'text-destructive' : 'text-warning'}
                                                        />
                                                    <div className="mt-1 h-full w-0.5 bg-border" />
                                                </div>
                                                <div className="flex-1 pb-4">
                                                    <p className="text-sm font-medium text-foreground">Batas Pengembalian</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {loan.due_date ? formatDateTimeLong(loan.due_date) : '-'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Status */}
                                            <div className="flex gap-3">
                                                <div className="flex flex-col items-center">
                                                    <RotateCcw size={14} className="text-muted-foreground" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-muted-foreground">Belum Dikembalikan</p>
                                                    <p className="text-xs text-muted-foreground">Menunggu pengembalian</p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Fine Estimation Card (if overdue) */}
                        {loan.status === 'overdue' && (
                            <Card className="border-destructive/30 bg-destructive/5">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-3">
                                        <CreditCard size={20} className="text-destructive" />
                                        <CardTitle className="text-base">Estimasi Denda</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Keterlambatan</span>
                                            <span className="font-semibold text-destructive">{loan.overdue_days} hari</span>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Total Denda</span>
                                            <span className="text-lg font-bold text-destructive">{formatCurrency(loan.estimated_fine)}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">*Denda Rp 1.000/hari keterlambatan</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* No Fine Card (if on time) */}
                        {loan.status === 'active' && (
                            <Card className="border-primary/30 bg-primary/5">
                                <CardContent className="flex items-center gap-4 p-4">
                                    <CheckCircle size={24} className="text-primary" />
                                    <div>
                                        <p className="font-semibold text-foreground">Masih Dalam Waktu</p>
                                        <p className="text-sm text-muted-foreground">{loan.days_remaining} hari tersisa</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            {loan.status === 'pending' ? (
                                // Pending: Show Approve/Reject buttons
                                <>
                                    <Button className="w-full gap-2" onClick={() => setApproveDialogOpen(true)}>
                                        <CheckCircle size={18} />
                                        Setujui Peminjaman
                                    </Button>
                                    <Button variant="destructive" className="w-full gap-2" onClick={() => setRejectDialogOpen(true)}>
                                        <XCircle size={18} />
                                        Tolak Peminjaman
                                    </Button>
                                </>
                            ) : loan.status === 'active' || loan.status === 'overdue' ? (
                                // Active/Overdue: Show Return button
                                <Button className="w-full gap-2" onClick={() => setReturnDialogOpen(true)}>
                                    <RotateCcw size={18} />
                                    Proses Pengembalian
                                </Button>
                            ) : null}
                            <Button variant="outline" className="w-full" asChild>
                                <Link href="/admin/loans">Kembali ke Daftar</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Return Confirmation Dialog */}
            <AlertDialog
                open={returnDialogOpen}
                onOpenChange={(open) => {
                    // Don't allow closing dialog while processing
                    if (!isProcessing) {
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
                                    Anda akan memproses pengembalian buku <span className="font-semibold text-foreground">"{book.title}"</span> dari{' '}
                                    <span className="font-semibold text-foreground">{student.name}</span>.
                                </p>
                                {loan.status === 'overdue' && (
                                    <>
                                        <div className="rounded-lg bg-destructive/10 p-3">
                                            <p className="text-sm font-medium text-destructive">Keterlambatan: {loan.overdue_days} hari</p>
                                            <p className="text-sm text-destructive">Denda Otomatis: {formatCurrency(originalAmount)}</p>
                                        </div>

                                        <div className="space-y-3 rounded-lg border border-border bg-muted/50 p-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="adjusted_amount" className="text-sm font-medium">
                                                    Edit Denda (Opsional)
                                                </Label>
                                                <Input
                                                    id="adjusted_amount"
                                                    type="number"
                                                    placeholder={originalAmount.toString()}
                                                    value={adjustedAmount}
                                                    onChange={(e) => setAdjustedAmount(e.target.value)}
                                                    min={0}
                                                    max={100000}
                                                    step={1000}
                                                    className="bg-background"
                                                />
                                                {errors.adjusted_amount && <p className="text-xs text-destructive">{errors.adjusted_amount}</p>}
                                                <p className="text-xs text-muted-foreground">Min: Rp 0, Max: Rp 100.000</p>
                                            </div>

                                            {isAmountChanged && (
                                                <div className="space-y-2">
                                                    <Label htmlFor="adjustment_reason" className="text-sm font-medium">
                                                        Alasan Perubahan <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Textarea
                                                        id="adjustment_reason"
                                                        placeholder="Contoh: Siswa sakit dengan surat dokter, 2 hari adalah hari libur nasional..."
                                                        value={adjustmentReason}
                                                        onChange={(e) => setAdjustmentReason(e.target.value)}
                                                        minLength={10}
                                                        maxLength={500}
                                                        rows={3}
                                                        className="resize-none bg-background"
                                                    />
                                                    {errors.adjustment_reason && (
                                                        <p className="text-xs text-destructive">{errors.adjustment_reason}</p>
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
                        <AlertDialogCancel disabled={isProcessing}>Batal</AlertDialogCancel>
                        <Button onClick={handleReturnConfirm} disabled={isProcessing} className="gap-2">
                            <RotateCcw size={16} />
                            {isProcessing ? 'Memproses...' : 'Ya, Proses Pengembalian'}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Approve Confirmation Dialog */}
            <AlertDialog open={approveDialogOpen} onOpenChange={(open) => !isProcessing && setApproveDialogOpen(open)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <CheckCircle className="size-7 text-primary" />
                        <AlertDialogTitle>Setujui Peminjaman?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Anda akan menyetujui peminjaman buku <span className="font-semibold text-foreground">"{book.title}"</span> oleh{' '}
                            <span className="font-semibold text-foreground">{student.name}</span>.
                            <br />
                            <br />
                            Buku akan dipinjamkan selama <span className="font-semibold text-foreground">3 hari</span> dan siswa wajib mengembalikan
                            tepat waktu.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessing}>Batal</AlertDialogCancel>
                        <Button onClick={handleApprove} disabled={isProcessing} className="gap-2">
                            <CheckCircle size={16} />
                            {isProcessing ? 'Memproses...' : 'Ya, Setujui'}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reject Confirmation Dialog */}
            <AlertDialog open={rejectDialogOpen} onOpenChange={(open) => !isProcessing && setRejectDialogOpen(open)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <XCircle className="size-7 text-destructive" />
                        <AlertDialogTitle>Tolak Peminjaman?</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-4">
                                <p>
                                    Anda akan menolak peminjaman buku <span className="font-semibold text-foreground">"{book.title}"</span> oleh{' '}
                                    <span className="font-semibold text-foreground">{student.name}</span>.
                                </p>
                                <div className="space-y-2">
                                    <Label htmlFor="rejection_reason" className="text-sm font-medium">
                                        Alasan Penolakan (Opsional)
                                    </Label>
                                    <Textarea
                                        id="rejection_reason"
                                        placeholder="Contoh: Buku sedang rusak, stok habis, dll..."
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        maxLength={500}
                                        rows={3}
                                        className="resize-none"
                                    />
                                    {errors.rejection_reason && <p className="text-xs text-destructive">{errors.rejection_reason}</p>}
                                    <p className="text-xs text-muted-foreground">{rejectionReason.length}/500 karakter</p>
                                </div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessing}>Batal</AlertDialogCancel>
                        <Button onClick={handleReject} disabled={isProcessing} variant="destructive" className="gap-2">
                            <XCircle size={16} />
                            {isProcessing ? 'Memproses...' : 'Ya, Tolak'}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}
