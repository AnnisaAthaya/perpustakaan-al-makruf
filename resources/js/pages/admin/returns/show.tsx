import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AdminLayout from '@/layouts/admin/admin-layout';
import { formatDateTimeLong } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Calendar, CheckCircle2, Clock, CreditCard, RotateCcw, User, XCircle } from 'lucide-react';

interface BookReturn {
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
    borrowed_at: string;
    due_date: string;
    returned_at: string;
    status: 'on_time' | 'late';
    late_days: number;
    fine_amount: number;
    fine_status: 'no_fine' | 'unpaid' | 'paid';
    fine_paid_at: string | null;
    notes: string | null;
    payment_proof: string | null;
}

interface ShowReturnProps {
    returnData: BookReturn;
}

// Remove local formatDate, using centralized formatDateTimeLong from utils

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

export default function ShowReturn({ returnData }: ShowReturnProps) {
    const { student, book } = returnData;

    return (
        <AdminLayout>
            <Head title={`Detail Pengembalian - ${book.title}`} />

            <div className="mx-auto max-w-4xl space-y-6">
                {/* Page Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/returns"
                        className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-foreground">Detail Pengembalian</h1>
                        <p className="mt-0.5 text-muted-foreground">ID Transaksi: #{returnData.id}</p>
                    </div>
                    {returnData.status === 'on_time' ? (
                        <Badge variant="success" className="gap-1 px-3 py-1.5 text-sm">
                            <CheckCircle2 size={14} />
                            Tepat Waktu
                        </Badge>
                    ) : (
                        <Badge variant="destructive" className="gap-1 px-3 py-1.5 text-sm">
                            <XCircle size={14} />
                            Terlambat {returnData.late_days} Hari
                        </Badge>
                    )}
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
                        {returnData.notes && (
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Catatan</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{returnData.notes}</p>
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
                                    {/* Borrowed Date */}
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <BookOpen size={14} className="text-primary" />
                                            <div className="mt-1 h-full w-0.5 bg-border" />
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <p className="text-sm font-medium text-foreground">Dipinjam</p>
                                            <p className="text-xs text-muted-foreground">{formatDateTimeLong(returnData.borrowed_at)}</p>
                                        </div>
                                    </div>

                                    {/* Due Date */}
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <Clock size={14} className="text-warning" />
                                            <div className="mt-1 h-full w-0.5 bg-border" />
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <p className="text-sm font-medium text-foreground">Batas Pengembalian</p>
                                            <p className="text-xs text-muted-foreground">{formatDateTimeLong(returnData.due_date)}</p>
                                        </div>
                                    </div>

                                    {/* Returned Date */}
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <RotateCcw size={14} className={returnData.status === 'on_time' ? 'text-primary' : 'text-destructive'} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-foreground">Dikembalikan</p>
                                            <p className="text-xs text-muted-foreground">{formatDateTimeLong(returnData.returned_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Fine Card */}
                        {returnData.fine_status !== 'no_fine' && (
                            <Card
                                className={
                                    returnData.fine_status === 'paid' ? 'border-primary/30 bg-primary/5' : 'border-destructive/30 bg-destructive/5'
                                }
                            >
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-3">
                                        <CreditCard size={20} className={returnData.fine_status === 'paid' ? 'text-primary' : 'text-destructive'} />
                                        <CardTitle className="text-base">Informasi Denda</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Keterlambatan</span>
                                            <span className="font-semibold text-foreground">{returnData.late_days} hari</span>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Total Denda</span>
                                            <span className="text-lg font-bold text-foreground">{formatCurrency(returnData.fine_amount)}</span>
                                        </div>

                                        {returnData.payment_proof && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Bukti Pembayaran</span>
                                                {/* View Payment Proof Dialog */}
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="link" size="sm" className="p-0 text-right">
                                                            Lihat Bukti
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="max-w-md">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Bukti Pembayaran</AlertDialogTitle>
                                                        </AlertDialogHeader>
                                                        <div className="py-4">
                                                            {returnData?.payment_proof && (
                                                                <img
                                                                    src={returnData.payment_proof}
                                                                    alt="Bukti pembayaran"
                                                                    className="w-full rounded-xl border border-border object-contain"
                                                                />
                                                            )}
                                                        </div>

                                                        <AlertDialogCancel asChild>
                                                            <Button variant="outline" className="w-full">
                                                                Tutup
                                                            </Button>
                                                        </AlertDialogCancel>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Status</span>
                                            {returnData.fine_status === 'paid' ? (
                                                <Badge variant="success">Lunas</Badge>
                                            ) : (
                                                <Badge variant="destructive">Belum Lunas</Badge>
                                            )}
                                        </div>
                                        {returnData.fine_paid_at && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Dibayar pada</span>
                                                <span className="text-sm font-medium">{formatDateTimeLong(returnData.fine_paid_at)}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* No Fine Card */}
                        {returnData.fine_status === 'no_fine' && (
                            <Card className="border-primary/30 bg-primary/5">
                                <CardContent className="flex items-center gap-4 p-4">
                                    <CheckCircle2 size={24} className="text-primary" />
                                    <div>
                                        <p className="font-semibold text-foreground">Tidak Ada Denda</p>
                                        <p className="text-sm text-muted-foreground">Buku dikembalikan tepat waktu</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Action Button */}
                        <Button variant="outline" className="w-full" asChild>
                            <Link href="/admin/returns">Kembali ke Daftar</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
