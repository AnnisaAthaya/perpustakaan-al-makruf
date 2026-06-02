import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ModalShell } from '@/components/generated-components/modal-shell';
import { Separator } from '@/components/ui/separator';
import { formatDateTimeLong, formatCurrency, getCategoryColorSolid } from '@/lib/utils';
import { LoanStatus } from '@/types';
import { Link } from '@inertiajs/react';
import { AlertCircle, BookMarked, Calendar, Clock, FileImage, XCircle } from 'lucide-react';

export interface LoanDetailItem {
    id: number;
    book: {
        id: number;
        title: string;
        author: string;
        category: string;
        cover?: string;
        location?: string;
    };
    requested_at?: string | null;
    borrowed_at: string | null;
    due_date: string | null;
    returned_at: string | null;
    status: LoanStatus;
    status_label?: string;
    status_color?: string;
    is_overdue?: boolean;
    is_pending?: boolean;
    can_cancel?: boolean;
    overdue_days?: number;
    days_remaining?: number;
    estimated_fine?: number;
    rejection_reason?: string | null;
    cancellation_reason?: string | null;
    fine: {
        id: number;
        amount: number;
        late_days: number;
        status: 'unpaid' | 'pending_verification' | 'paid';
    } | null;
}

interface LoanDetailDialogProps {
    loan: LoanDetailItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCancelRequest?: (loan: LoanDetailItem) => void;
}

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
            label: 'Menunggu Konfirmasi',
            className: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
        },
        dipinjam: {
            label: 'Sedang Dipinjam',
            className: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
        },
        dikembalikan: {
            label: 'Sudah Dikembalikan',
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
            label: 'Belum Dibayar',
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

function InfoRow({ icon: Icon, label, value, valueClassName }: { icon: React.ElementType; label: string; value: string; valueClassName?: string }) {
    return (
        <div className="flex items-start gap-3">
            <Icon size={20} className="text-primary" />
            <div className="flex flex-col">
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</span>
                <span className={`text-sm font-semibold ${valueClassName || 'text-foreground'}`}>{value}</span>
            </div>
        </div>
    );
}

export function LoanDetailDialog({ loan, open, onOpenChange, onCancelRequest }: LoanDetailDialogProps) {
    if (!loan) return null;

    const displayStatus = getDisplayStatus(loan);
    const statusBadge = getStatusBadge(displayStatus);
    const fineAmount = loan.fine?.amount ?? (loan.is_overdue ? (loan.estimated_fine ?? 0) : 0);
    const fineStatus = loan.fine?.status ?? (loan.is_overdue ? 'unpaid' : null);
    const fineStatusBadge = fineStatus ? getFineStatusBadge(fineStatus) : null;
    const showPayButton = fineAmount > 0 && fineStatus === 'unpaid';
    const isPending = loan.status === 'pending';
    const isRejected = loan.status === 'rejected';
    const isCancelled = loan.status === 'cancelled';

    return (
        <ModalShell
            open={open}
            onOpenChange={onOpenChange}
            title="Detail Peminjaman"
            description="Informasi detail peminjaman buku"
            size="lg"
            footer={
                <>
                    <Button variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
                        Tutup
                    </Button>

                    {isPending && loan.can_cancel && onCancelRequest && (
                        <Button
                            variant="destructive"
                            className="w-full sm:flex-1"
                            onClick={() => {
                                onOpenChange(false);
                                onCancelRequest(loan);
                            }}
                        >
                            <XCircle size={16} className="mr-2" />
                            Batalkan Permintaan
                        </Button>
                    )}

                    {showPayButton && (
                        <Button className="w-full sm:flex-1" asChild>
                            <Link href="/fines">
                                <FileImage size={16} className="mr-2" />
                                Bayar Denda
                            </Link>
                        </Button>
                    )}
                </>
            }
        >
            <div className="flex flex-col gap-6 pr-2 max-h-[70vh] overflow-y-auto">
                {/* Book Info Header */}
                <div className="flex gap-4">
                    {/* Book Cover */}
                    {loan.book.cover ? (
                        <div className="h-32 w-24 flex-shrink-0 overflow-hidden rounded-xl shadow-md">
                            <img src={`/storage/${loan.book.cover}`} alt={loan.book.title} className="h-full w-full object-cover" />
                        </div>
                    ) : (
                        <div
                            className={`shadow-soft flex aspect-[3/4] w-24 flex-col items-center justify-center rounded-xl p-4 text-white ${getCategoryColorSolid(loan.book.category)}`}
                        >
                            <BookMarked size={32} strokeWidth={1.5} className="mb-2 opacity-80" />
                            <p className="line-clamp-2 text-center text-xs leading-tight font-medium opacity-90">{loan.book.title}</p>
                        </div>
                    )}

                    {/* Book Details */}
                    <div className="flex flex-1 flex-col justify-center gap-2">
                        <Badge variant="secondary" className="w-fit">
                            {loan.book.category}
                        </Badge>
                        <h2 className="text-lg leading-snug font-bold text-foreground">{loan.book.title}</h2>
                        <p className="text-sm text-muted-foreground">{loan.book.author}</p>
                        <Badge className={`w-fit ${statusBadge.className}`}>{statusBadge.label}</Badge>
                    </div>
                </div>

                <Separator className="my-2" />

                {/* Pending Status Info */}
                {isPending && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <div className="flex items-start gap-3">
                            <Clock size={20} className="text-amber-600" />
                            <div>
                                <h4 className="font-semibold text-amber-800">Menunggu Konfirmasi Admin</h4>
                                <p className="mt-1 text-sm text-amber-700">
                                    Permintaan peminjaman Anda sedang diproses. Anda dapat membatalkan permintaan ini jika berubah pikiran.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Rejected Status Info */}
                {isRejected && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                        <div className="flex items-start gap-3">
                            <XCircle size={20} className="text-red-600" />
                            <div>
                                <h4 className="font-semibold text-red-800">Permintaan Ditolak</h4>
                                {loan.rejection_reason && <p className="mt-1 text-sm text-red-700">Alasan: {loan.rejection_reason}</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* Cancelled Status Info */}
                {isCancelled && (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle size={20} className="text-gray-600" />
                            <div>
                                <h4 className="font-semibold text-gray-800">Permintaan Dibatalkan</h4>
                                {loan.cancellation_reason && <p className="mt-1 text-sm text-gray-700">Alasan: {loan.cancellation_reason}</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* Loan Details - Only show if not pending/rejected/cancelled */}
                {!isPending && !isRejected && !isCancelled && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold tracking-wide text-foreground uppercase">Informasi Peminjaman</h3>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {loan.borrowed_at && <InfoRow icon={Calendar} label="Tanggal Pinjam" value={formatDateTimeLong(loan.borrowed_at)} />}
                            {loan.due_date && <InfoRow icon={Clock} label="Batas Kembali" value={formatDateTimeLong(loan.due_date)} />}
                            {loan.returned_at && (
                                <InfoRow
                                    icon={Calendar}
                                    label="Tanggal Kembali"
                                    value={formatDateTimeLong(loan.returned_at)}
                                    valueClassName="text-primary"
                                />
                            )}
                            {loan.status === 'active' && (loan.days_remaining ?? 0) > 0 && (
                                <InfoRow icon={Clock} label="Sisa Waktu" value={`${loan.days_remaining} hari`} valueClassName="text-blue-600" />
                            )}
                            {loan.is_overdue && (
                                <InfoRow icon={Clock} label="Keterlambatan" value={`${loan.overdue_days} hari`} valueClassName="text-red-600" />
                            )}
                        </div>
                    </div>
                )}

                {/* Request Date - For pending/rejected/cancelled */}
                {(isPending || isRejected || isCancelled) && loan.requested_at && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold tracking-wide text-foreground uppercase">Informasi Permintaan</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <InfoRow icon={Calendar} label="Tanggal Permintaan" value={formatDateTimeLong(loan.requested_at)} />
                        </div>
                    </div>
                )}

                {/* Fine Section */}
                {fineAmount > 0 && (
                    <>
                        <Separator className="my-2" />
                        <div className="rounded-xl bg-red-50 p-4 card-accent-left-danger">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium tracking-wide text-red-600 uppercase">
                                        {loan.fine ? 'Total Denda' : 'Estimasi Denda'}
                                    </p>
                                    <p className="text-2xl font-bold text-red-600">{formatCurrency(fineAmount)}</p>
                                </div>
                                {fineStatusBadge && <Badge className={fineStatusBadge.className}>{fineStatusBadge.label}</Badge>}
                            </div>

                            {fineStatus === 'pending_verification' && (
                                <p className="mt-3 text-sm text-amber-700">
                                    Bukti pembayaran Anda sedang diverifikasi oleh admin. Mohon tunggu konfirmasi.
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </ModalShell>
    );
}
