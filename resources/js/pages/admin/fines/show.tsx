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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin/admin-layout';
import { formatDateTimeLong } from '@/lib/utils';
import { Head, Link, router } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, BookOpen, Calendar, CheckCircle, Clock, CreditCard, ImageIcon, User, XCircle } from 'lucide-react';
import { useState } from 'react';

interface Fine {
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
        cover: string | null;
    };
    borrowed_at: string;
    due_date: string;
    returned_at: string;
    late_days: number;
    amount: number;
    status: 'unpaid' | 'pending_verification' | 'paid';
    payment_proof: string | null;
    submitted_at: string | null;
    verified_at: string | null;
    notes: string | null;
}

interface ShowFineProps {
    fine: Fine;
}

// Remove local formatDate, using centralized formatDateTimeLong from utils

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

export default function ShowFine({ fine }: ShowFineProps) {
    const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [proofDialogOpen, setProofDialogOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const { student, book } = fine;

    const handleVerifyConfirm = () => {
        setIsProcessing(true);
        router.post(
            `/admin/fines/${fine.id}/verify`,
            {},
            {
                onSuccess: () => {
                    setVerifyDialogOpen(false);
                },
                onFinish: () => {
                    setIsProcessing(false);
                },
            },
        );
    };

    const handleRejectConfirm = () => {
        setIsProcessing(true);
        router.post(
            `/admin/fines/${fine.id}/reject`,
            {},
            {
                onSuccess: () => {
                    setRejectDialogOpen(false);
                },
                onFinish: () => {
                    setIsProcessing(false);
                },
            },
        );
    };

    const getStatusBadge = () => {
        switch (fine.status) {
            case 'paid':
                return (
                    <Badge variant="success" className="gap-1 px-3 py-1.5 text-sm">
                        <CheckCircle size={14} />
                        Lunas
                    </Badge>
                );
            case 'pending_verification':
                return (
                    <Badge variant="warning" className="gap-1 px-3 py-1.5 text-sm">
                        <Clock size={14} />
                        Menunggu Verifikasi
                    </Badge>
                );
            case 'unpaid':
            default:
                return (
                    <Badge variant="destructive" className="gap-1 px-3 py-1.5 text-sm">
                        <AlertCircle size={14} />
                        Belum Bayar
                    </Badge>
                );
        }
    };

    return (
        <AdminLayout>
            <Head title={`Detail Denda - ${student.name}`} />

            <div className="mx-auto max-w-4xl space-y-6">
                {/* Page Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/fines"
                            className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Detail Denda</h1>
                            <p className="mt-0.5 text-muted-foreground">ID Denda: #{fine.id}</p>
                        </div>
                    </div>
                    {getStatusBadge()}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Fine Amount Card */}
                        <Card className="shadow-sm border border-destructive">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <CreditCard size={28} className="text-destructive" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Total Denda</p>
                                            <p className="text-3xl font-bold text-destructive">{formatCurrency(fine.amount)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Keterlambatan</p>
                                        <p className="text-2xl font-bold text-foreground">{fine.late_days} hari</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Book Info Card */}
                        <Card>
                            <CardHeader className="border-b border-border pb-4">
                                <div className="flex items-center gap-3">
                                    <BookOpen className="size-7 shrink-0 text-primary" />
                                    <div>
                                        <CardTitle className="text-base">Informasi Buku</CardTitle>
                                        <CardDescription>Buku yang dikembalikan terlambat</CardDescription>
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
                                        <p className="text-sm">
                                            <span className="text-muted-foreground">Kode Buku:</span> <span className="font-medium">{book.code}</span>
                                        </p>
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
                                        <CardDescription>Data siswa yang terkena denda</CardDescription>
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
                    </div>

                    {/* Sidebar */}
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
                                    {/* Borrowed Date */}
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <BookOpen size={14} className="text-primary" />
                                            <div className="mt-1 h-full w-0.5 bg-border" />
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <p className="text-sm font-medium text-foreground">Dipinjam</p>
                                            <p className="text-xs text-muted-foreground">{formatDateTimeLong(fine.borrowed_at)}</p>
                                        </div>
                                    </div>

                                    {/* Due Date */}
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <Clock size={14} className="text-amber-600" />
                                            <div className="mt-1 h-full w-0.5 bg-border" />
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <p className="text-sm font-medium text-foreground">Batas Kembali</p>
                                            <p className="text-xs text-muted-foreground">{formatDateTimeLong(fine.due_date)}</p>
                                        </div>
                                    </div>

                                    {/* Returned Date */}
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <AlertCircle size={14} className="text-destructive" />
                                            {fine.status !== 'unpaid' && <div className="mt-1 h-full w-0.5 bg-border" />}
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <p className="text-sm font-medium text-foreground">Dikembalikan (Terlambat)</p>
                                            <p className="text-xs text-muted-foreground">{formatDateTimeLong(fine.returned_at)}</p>
                                        </div>
                                    </div>

                                    {/* Payment Submitted */}
                                    {fine.submitted_at && (
                                        <div className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <ImageIcon size={14} className="text-amber-600" />
                                                {fine.verified_at && <div className="mt-1 h-full w-0.5 bg-border" />}
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <p className="text-sm font-medium text-foreground">Bukti Dikirim</p>
                                                <p className="text-xs text-muted-foreground">{formatDateTimeLong(fine.submitted_at)}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Verified */}
                                    {fine.verified_at && (
                                        <div className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <CheckCircle size={14} className="text-emerald-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-foreground">Terverifikasi</p>
                                                <p className="text-xs text-muted-foreground">{formatDateTimeLong(fine.verified_at)}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Proof Card */}
                        {fine.payment_proof && (
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Bukti Pembayaran</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <button
                                        onClick={() => setProofDialogOpen(true)}
                                        className="w-full overflow-hidden rounded-xl border border-border transition-all hover:border-primary hover:shadow-md"
                                    >
                                        <img src={fine.payment_proof} alt="Bukti pembayaran" className="h-48 w-full object-cover" />
                                    </button>
                                    <p className="mt-2 text-center text-xs text-muted-foreground">Klik untuk memperbesar</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            {fine.status === 'pending_verification' && (
                                <>
                                    <Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={() => setVerifyDialogOpen(true)}>
                                        <CheckCircle size={18} />
                                        Verifikasi Pembayaran
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full gap-2 border-destructive text-destructive hover:bg-destructive/10"
                                        onClick={() => setRejectDialogOpen(true)}
                                    >
                                        <XCircle size={18} />
                                        Tolak Bukti
                                    </Button>
                                </>
                            )}
                            <Button variant="outline" className="w-full" asChild>
                                <Link href="/admin/fines">Kembali ke Daftar</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Payment Proof Dialog */}
            <AlertDialog open={proofDialogOpen} onOpenChange={setProofDialogOpen}>
                <AlertDialogContent className="max-w-lg">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bukti Pembayaran</AlertDialogTitle>
                    </AlertDialogHeader>
                    <div className="py-2">
                        {fine.payment_proof && <img src={fine.payment_proof} alt="Bukti pembayaran" className="w-full rounded-xl" />}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Tutup</AlertDialogCancel>
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
                            <span className="font-semibold text-foreground">{formatCurrency(fine.amount)}</span> dari{' '}
                            <span className="font-semibold text-foreground">{student.name}</span>.
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
                            Anda akan menolak bukti pembayaran dari <span className="font-semibold text-foreground">{student.name}</span>. Siswa akan
                            diminta untuk mengunggah bukti pembayaran yang baru.
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
