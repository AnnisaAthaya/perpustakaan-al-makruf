import { Button } from '@/components/ui/button';
import { ModalShell } from '@/components/generated-components/modal-shell';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BookMarked, Calendar, CheckCircle2, Clock, Info, MapPin } from 'lucide-react';
import { getCategoryColorSolid } from '@/lib/utils';

export interface BorrowBookItem {
    id: number;
    title: string;
    author: string;
    category: string;
    location: string;
    available: number;
}

interface BorrowBookDialogProps {
    book: BorrowBookItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm?: ((book: BorrowBookItem) => void) | (() => void);
    isSubmitting?: boolean;
}

function formatDate(date: Date): string {
    return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export function BorrowBookDialog({ book, open, onOpenChange, onConfirm, isSubmitting = false }: BorrowBookDialogProps) {
    if (!book) return null;

    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 3); // 3 days loan period

    const handleConfirm = () => {
        if (onConfirm && book) {
            onConfirm(book);
        }
    };

    return (
        <ModalShell
            open={open}
            onOpenChange={onOpenChange}
            title="Konfirmasi Peminjaman"
            description="Anda akan meminjam buku berikut. Pastikan data sudah benar."
            size="md"
            footer={
                <>
                    <Button variant="outline" disabled={isSubmitting} className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
                        Batal
                    </Button>
                    <Button onClick={handleConfirm} disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 sm:flex-1">
                        {isSubmitting ? (
                            <>
                                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Memproses...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={16} className="mr-2" />
                                Ya, Pinjam Sekarang
                            </>
                        )}
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-6">
                {/* Book Info Card */}
                <div className="rounded-xl border border-border bg-muted p-4">
                    <div className="flex gap-4">
                        {/* Mini Book Cover */}
                        <div
                            className={`flex aspect-[3/4] w-14 flex-shrink-0 items-center justify-center rounded-lg text-white shadow-md ${getCategoryColorSolid(book.category)}`}
                        >
                            <BookMarked size={20} strokeWidth={1.5} />
                        </div>

                        <div className="flex-1">
                            <Badge variant="secondary" className="mb-1.5 text-xs">
                                {book.category}
                            </Badge>
                            <h3 className="line-clamp-2 text-base leading-snug font-bold text-foreground">{book.title}</h3>
                            <p className="mt-0.5 text-sm text-muted-foreground">{book.author}</p>
                            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                                <MapPin size={12} className="text-primary" />
                                <span>{book.location}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Loan Details */}
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">Detail Peminjaman</h4>

                    <div className="grid gap-3">
                        {/* Borrow Date */}
                        <div className="flex items-center gap-3 rounded-lg bg-emerald-50 px-4 py-3 card-accent-left">
                            <Calendar size={18} className="text-emerald-600" />
                            <div>
                                <p className="text-xs font-medium text-emerald-600">Tanggal Pinjam</p>
                                <p className="text-sm font-bold text-emerald-700">{formatDate(today)}</p>
                            </div>
                        </div>

                        {/* Due Date */}
                        <div className="flex items-center gap-3 rounded-lg bg-amber-50 px-4 py-3">
                            <Clock size={18} className="text-amber-600" />
                            <div>
                                <p className="text-xs font-medium text-amber-600">Batas Pengembalian</p>
                                <p className="text-sm font-bold text-amber-700">{formatDate(dueDate)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Terms Notice */}
                <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <Info size={18} className="mt-0.5 shrink-0 text-blue-600" />
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-blue-800">Ketentuan Peminjaman:</p>
                        <ul className="list-inside list-disc space-y-0.5 text-xs text-blue-700">
                            <li>Durasi peminjaman maksimal 3 hari</li>
                            <li>Denda keterlambatan Rp 2.000/hari</li>
                            <li>Jaga kondisi buku dengan baik</li>
                        </ul>
                    </div>
                </div>
            </div>
        </ModalShell>
    );
}
