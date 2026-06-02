import { Button } from '@/components/ui/button';
import { ModalShell } from '@/components/generated-components/modal-shell';
import { Separator } from '@/components/ui/separator';
import { Link } from '@inertiajs/react';
import { BookMarked, Clock, MapPin, XCircle } from 'lucide-react';
import { getCategoryColorSolid } from '@/lib/utils';

export interface BorrowResultBook {
    id: number;
    title: string;
    author: string;
    category: string;
    location: string;
}

interface BorrowResultDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    success: boolean;
    book: BorrowResultBook | null;
    message?: string;
}

export function BorrowResultDialog({ open, onOpenChange, success, book, message }: BorrowResultDialogProps) {
    return (
        <ModalShell
            open={open}
            onOpenChange={onOpenChange}
            title={success ? "Permintaan Terkirim!" : "Permintaan Gagal"}
            description={
                success
                    ? (message || 'Permintaan peminjaman buku berhasil dikirim. Menunggu konfirmasi dari admin perpustakaan.')
                    : (message || 'Maaf, terjadi kesalahan saat memproses permintaan peminjaman buku.')
            }
            size="md"
            footer={
                <>
                    <Button variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
                        Tutup
                    </Button>
                    {success && (
                        <Button className="w-full bg-amber-600 hover:bg-amber-700 sm:flex-1" asChild>
                            <Link href="/loans">Lihat Riwayat Peminjaman</Link>
                        </Button>
                    )}
                </>
            }
        >
            <div className="flex flex-col gap-6 text-center sm:text-left">
                {success ? (
                    <Clock size={32} className="text-amber-600" />
                ) : (
                    <XCircle size={32} className="text-red-600" />
                )}

                {success && book && (
                    <div className="flex flex-col gap-6 text-left">
                        <Separator />

                        {/* Book Info */}
                        <div className="rounded-xl border border-border bg-muted p-4">
                            <div className="flex gap-4">
                                <div
                                    className={`flex aspect-[3/4] w-14 flex-shrink-0 items-center justify-center rounded-lg text-white shadow-md ${getCategoryColorSolid(book.category)}`}
                                >
                                    <BookMarked size={20} strokeWidth={1.5} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-muted-foreground">{book.category}</p>
                                    <h3 className="line-clamp-2 text-base leading-snug font-bold text-foreground">{book.title}</h3>
                                    <p className="mt-0.5 text-sm text-muted-foreground">{book.author}</p>
                                    <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <MapPin size={12} className="text-primary" />
                                        <span>{book.location}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pending Status Info */}
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                            <div className="flex items-start gap-3">
                                <Clock size={20} className="text-amber-600" />
                                <div>
                                    <h4 className="font-semibold text-amber-800">Menunggu Konfirmasi</h4>
                                    <p className="mt-1 text-sm text-amber-700">
                                        Admin akan memproses permintaan Anda. Anda akan mendapatkan notifikasi setelah permintaan dikonfirmasi.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Steps Info */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-foreground">Langkah Selanjutnya:</h4>
                            <ol className="space-y-1.5 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-medium text-amber-700">
                                        1
                                    </span>
                                    <span>Tunggu konfirmasi dari admin perpustakaan</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-medium text-amber-700">
                                        2
                                    </span>
                                    <span>Setelah dikonfirmasi, ambil buku di lokasi yang tertera</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-medium text-amber-700">
                                        3
                                    </span>
                                    <span>Kembalikan buku sebelum batas waktu (3 hari)</span>
                                </li>
                            </ol>
                        </div>

                        {/* Note */}
                        <div className="rounded-lg border border-muted bg-muted p-3 text-center">
                            <p className="text-xs text-muted-foreground">
                                Anda dapat membatalkan permintaan ini selama masih dalam status menunggu konfirmasi.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </ModalShell>
    );
}
