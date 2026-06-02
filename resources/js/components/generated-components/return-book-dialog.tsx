import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ModalShell } from '@/components/generated-components/modal-shell';
import { Separator } from '@/components/ui/separator';
import { formatDateTimeLong, formatCurrency, getCategoryColorSolid } from '@/lib/utils';
import { AlertTriangle, BookMarked, Calendar, Clock, Info, MapPin } from 'lucide-react';

export interface ActiveLoanItem {
    id: number;
    book: {
        id: number;
        title: string;
        author: string;
        category: string;
        cover?: string;
        location?: string;
    };
    borrowed_at: string;
    due_date: string;
    is_overdue: boolean;
    overdue_days: number;
    days_remaining: number;
    estimated_fine: number;
}

interface ReturnBookDialogProps {
    loan: ActiveLoanItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
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

export function ReturnBookDialog({ loan, open, onOpenChange }: ReturnBookDialogProps) {
    if (!loan) return null;

    const isOverdue = loan.is_overdue;

    return (
        <ModalShell
            open={open}
            onOpenChange={onOpenChange}
            title="Detail Peminjaman"
            description={
                isOverdue
                    ? 'Buku ini terlambat dikembalikan. Segera kembalikan ke perpustakaan.'
                    : 'Informasi buku yang sedang Anda pinjam.'
            }
            size="md"
            footer={
                <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
                    Tutup
                </Button>
            }
        >
            <div className="flex flex-col gap-6">
                {/* Book Info */}
                <div className="flex gap-4">
                    {loan.book.cover ? (
                        <div className="h-28 w-20 flex-shrink-0 overflow-hidden rounded-xl shadow-md">
                            <img src={`/storage/${loan.book.cover}`} alt={loan.book.title} className="h-full w-full object-cover" />
                        </div>
                    ) : (
                        <div
                            className={`shadow-soft flex aspect-[3/4] w-20 flex-col items-center justify-center rounded-xl p-3 text-white ${getCategoryColorSolid(loan.book.category)}`}
                        >
                            <BookMarked size={28} strokeWidth={1.5} className="mb-2 opacity-80" />
                            <p className="line-clamp-2 text-center text-xs leading-tight font-medium opacity-90">{loan.book.title}</p>
                        </div>
                    )}

                    <div className="flex flex-1 flex-col justify-center gap-1">
                        <Badge variant="secondary" className="w-fit text-xs">
                            {loan.book.category}
                        </Badge>
                        <h3 className="text-base font-bold text-foreground">{loan.book.title}</h3>
                        <p className="text-sm text-muted-foreground">{loan.book.author}</p>
                        {loan.book.location && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin size={12} />
                                {loan.book.location}
                            </div>
                        )}
                    </div>
                </div>

                <Separator />

                {/* Loan Details */}
                <div className="grid grid-cols-2 gap-3">
                    <InfoRow icon={Calendar} label="Tanggal Pinjam" value={formatDateTimeLong(loan.borrowed_at)} />
                    <InfoRow icon={Clock} label="Batas Kembali" value={formatDateTimeLong(loan.due_date)} />
                </div>

                {/* Status Info */}
                {isOverdue ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 card-accent-left-danger">
                        <div className="flex items-center gap-2">
                            <AlertTriangle size={16} className="text-red-600" />
                            <span className="text-sm font-semibold text-red-800">Terlambat {loan.overdue_days} Hari</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-red-600">{formatCurrency(loan.estimated_fine)}</p>
                        <p className="mt-1 text-xs text-red-600">Estimasi denda: {loan.overdue_days} hari x Rp 2.000/hari</p>
                        <p className="mt-2 text-sm text-red-700">Segera kembalikan buku ke perpustakaan untuk menghindari denda yang lebih besar.</p>
                    </div>
                ) : loan.days_remaining === 0 ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-amber-600" />
                            <span className="text-sm font-semibold text-amber-800">Hari Ini Batas Kembali</span>
                        </div>
                        <p className="mt-1 text-sm text-amber-700">Segera kembalikan buku ke perpustakaan hari ini.</p>
                    </div>
                ) : (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 card-accent-left">
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-emerald-600" />
                            <span className="text-sm font-semibold text-emerald-800">Sisa Waktu: {loan.days_remaining} Hari</span>
                        </div>
                        <p className="mt-1 text-sm text-emerald-700">Anda masih memiliki waktu untuk mengembalikan buku ini.</p>
                    </div>
                )}

                {/* Info Notice */}
                <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <Info size={18} className="mt-0.5 shrink-0 text-blue-600" />
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-blue-800">Cara Pengembalian:</p>
                        <p className="text-xs text-blue-700">
                            Bawa buku ke perpustakaan dan serahkan kepada petugas. Petugas akan memproses pengembalian dan menghitung denda jika ada.
                        </p>
                    </div>
                </div>
            </div>
        </ModalShell>
    );
}
