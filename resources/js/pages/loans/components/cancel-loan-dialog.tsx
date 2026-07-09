import type { LoanDetailItem } from '@/components/generated-components/loan-detail-dialog';
import { ModalShell } from '@/components/generated-components/modal-shell';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getCategoryColorSolid } from '@/lib/utils';
import { BookMarked, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface CancelLoanDialogProps {
    loan: LoanDetailItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (reason: string) => void;
    isLoading?: boolean;
}

export function CancelLoanDialog({ loan, open, onOpenChange, onConfirm, isLoading = false }: CancelLoanDialogProps) {
    const [reason, setReason] = useState('');

    const handleConfirm = () => {
        onConfirm(reason);
        setReason('');
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!isLoading) {
            onOpenChange(newOpen);
            if (!newOpen) {
                setReason('');
            }
        }
    };

    if (!loan) return null;

    return (
        <ModalShell
            open={open}
            onOpenChange={handleOpenChange}
            title="Batalkan Permintaan?"
            description="Apakah Anda yakin ingin membatalkan permintaan peminjaman buku ini?"
            size="md"
            footer={
                <>
                    <Button variant="outline" className="w-full sm:w-auto" onClick={() => handleOpenChange(false)} disabled={isLoading}>
                        Kembali
                    </Button>
                    <Button variant="destructive" className="w-full sm:flex-1" onClick={handleConfirm} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 size={16} className="mr-2 animate-spin" />
                                Membatalkan...
                            </>
                        ) : (
                            'Ya, Batalkan Permintaan'
                        )}
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-6">
                {/* Book Info */}
                <div className="rounded-xl border border-border bg-muted p-4">
                    <div className="flex gap-4">
                        {loan.book.cover ? (
                            <div className="h-20 w-14 flex-shrink-0 overflow-hidden rounded-lg shadow-md">
                                <img src={`/storage/${loan.book.cover}`} alt={loan.book.title} className="h-full w-full object-cover" />
                            </div>
                        ) : (
                            <div
                                className={`flex aspect-[3/4] w-14 flex-shrink-0 items-center justify-center rounded-lg text-white shadow-md ${getCategoryColorSolid(loan.book.category)}`}
                            >
                                <BookMarked size={20} strokeWidth={1.5} />
                            </div>
                        )}
                        <div className="flex-1">
                            <p className="text-xs font-medium text-muted-foreground">{loan.book.category}</p>
                            <h3 className="line-clamp-2 text-base leading-snug font-bold text-foreground">{loan.book.title}</h3>
                            <p className="mt-0.5 text-sm text-muted-foreground">{loan.book.author}</p>
                        </div>
                    </div>
                </div>

                {/* Reason Input */}
                <div className="space-y-2">
                    <Label htmlFor="cancel-reason">Alasan Pembatalan (Opsional)</Label>
                    <Textarea
                        id="cancel-reason"
                        placeholder="Tuliskan alasan pembatalan jika ada..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="min-h-[80px] resize-none"
                        disabled={isLoading}
                    />
                </div>

                {/* Warning */}
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-sm text-amber-800">
                        Setelah dibatalkan, stok buku akan dikembalikan dan Anda dapat mengajukan permintaan peminjaman kembali.
                    </p>
                </div>
            </div>
        </ModalShell>
    );
}
