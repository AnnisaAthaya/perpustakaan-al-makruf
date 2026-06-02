import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ModalShell } from '@/components/generated-components/modal-shell';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { router } from '@inertiajs/react';
import { BookMarked, CheckCircle2, ImagePlus, QrCode, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { formatCurrency, getCategoryColorSolid } from '@/lib/utils';

export interface PayFineItem {
    id: number;
    bookTitle: string;
    bookAuthor: string;
    bookCategory: string;
    borrowDate: string;
    dueDate: string;
    returnDate: string | null;
    daysOverdue: number;
    finePerDay: number;
    totalFine: number;
    status: 'belum_bayar' | 'menunggu_verifikasi' | 'lunas';
    paymentProof: string | null;
}

interface PayFineDialogProps {
    fine: PayFineItem | null;
    fineId: number | null;
    qrisImage: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PayFineDialog({ fine, fineId, qrisImage, open, onOpenChange }: PayFineDialogProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!fine) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Ukuran file maksimal 5MB');
                return;
            }
            setError(null);
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setError(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = () => {
        if (!selectedFile || !fineId) return;

        setIsSubmitting(true);
        setError(null);

        const formData = new FormData();
        formData.append('payment_proof', selectedFile);

        router.post(`/fines/${fineId}/upload-proof`, formData, {
            forceFormData: true,
            onSuccess: () => {
                setIsSubmitting(false);
                setIsSubmitted(true);
            },
            onError: (errors) => {
                setIsSubmitting(false);
                if (errors.payment_proof) {
                    setError(errors.payment_proof as string);
                } else {
                    setError('Terjadi kesalahan saat mengirim bukti pembayaran.');
                }
            },
        });
    };

    const handleClose = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setIsSubmitted(false);
        setError(null);
        onOpenChange(false);
    };

    // Success state after submission
    if (isSubmitted) {
        return (
            <ModalShell
                open={open}
                onOpenChange={handleClose}
                title="Bukti Pembayaran Terkirim!"
                size="md"
            >
                <div className="flex flex-col items-center text-center">
                    <CheckCircle2 size={32} className="text-emerald-600" />
                    <p className="mt-2 text-muted-foreground">
                        Bukti pembayaran Anda sedang diverifikasi oleh admin. Anda akan mendapat notifikasi setelah pembayaran dikonfirmasi.
                    </p>
                    <Button className="mt-6 w-full" onClick={handleClose}>
                        Tutup
                    </Button>
                </div>
            </ModalShell>
        );
    }

    return (
        <ModalShell
            open={open}
            onOpenChange={handleClose}
            title="Pembayaran Denda"
            description="Lakukan pembayaran melalui QRIS dan upload bukti pembayaran"
            size="lg"
            footer={
                <>
                    <Button variant="outline" className="w-full sm:w-auto" onClick={handleClose}>
                        Batal
                    </Button>
                    <Button className="w-full sm:flex-1" onClick={handleSubmit} disabled={!selectedFile || isSubmitting}>
                        {isSubmitting ? 'Mengirim...' : 'Kirim Bukti Pembayaran'}
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-6 max-h-[70vh] overflow-y-auto pr-2">
                {/* Book Info */}
                <div className="flex gap-3 rounded-xl bg-muted p-3">
                    <div
                        className={`flex h-12 w-10 items-center justify-center rounded-lg text-white ${getCategoryColorSolid(fine.bookCategory)}`}
                    >
                        <BookMarked size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">{fine.bookTitle}</p>
                        <p className="text-sm text-muted-foreground">{fine.bookAuthor}</p>
                    </div>
                </div>

                {/* Fine Details */}
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-red-600 uppercase">Total Denda</p>
                            <p className="text-2xl font-bold text-red-700">{formatCurrency(fine.totalFine)}</p>
                        </div>
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">{fine.daysOverdue} hari terlambat</Badge>
                    </div>
                    <p className="mt-2 text-xs text-red-600">
                        Perhitungan: {fine.daysOverdue} hari x {formatCurrency(fine.finePerDay)}/hari
                    </p>
                </div>

                <Separator />

                {/* QRIS Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <QrCode size={18} className="text-primary" />
                        <h3 className="font-semibold text-foreground">Scan QRIS untuk Pembayaran</h3>
                    </div>

                    <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-primary bg-emerald-50 p-6">
                        {qrisImage ? (
                            <div className="shadow-soft mb-3 flex h-48 w-48 items-center justify-center rounded-xl bg-white p-2">
                                <img src={`/storage/${qrisImage}`} alt="QRIS Pembayaran" className="h-full w-full rounded-lg object-contain" />
                            </div>
                        ) : (
                            <div className="shadow-soft mb-3 flex h-48 w-48 items-center justify-center rounded-xl bg-white p-4">
                                <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border border-muted">
                                    <QrCode size={80} className="text-muted-foreground" />
                                    <p className="mt-2 text-xs text-muted-foreground">QRIS Perpustakaan</p>
                                </div>
                            </div>
                        )}
                        <p className="text-center text-sm text-muted-foreground">
                            Scan kode QR di atas menggunakan aplikasi e-wallet atau mobile banking Anda
                        </p>
                        <p className="mt-1 text-center text-xs text-muted-foreground">DANA, GoPay, OVO, ShopeePay, LinkAja, atau Mobile Banking</p>
                    </div>
                </div>

                <Separator />

                {/* Upload Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Upload size={18} className="text-primary" />
                        <h3 className="font-semibold text-foreground">Upload Bukti Pembayaran</h3>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="payment-proof" className="text-sm text-muted-foreground">
                            Upload screenshot atau foto bukti transfer pembayaran
                        </Label>

                        {!previewUrl ? (
                            <div
                                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 p-8 transition-colors hover:border-primary/50 hover:bg-emerald-50"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <ImagePlus size={40} className="text-muted-foreground/50" />
                                <p className="mt-2 text-sm font-medium text-muted-foreground">Klik untuk upload gambar</p>
                                <p className="text-xs text-muted-foreground/70">PNG, JPG maksimal 5MB</p>
                            </div>
                        ) : (
                            <div className="relative">
                                <img src={previewUrl} alt="Preview bukti bayar" className="h-48 w-full rounded-xl object-cover" />
                                <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={handleRemoveFile}>
                                    <X size={16} />
                                </Button>
                                <p className="mt-2 truncate text-sm text-muted-foreground">{selectedFile?.name}</p>
                            </div>
                        )}

                        <Input ref={fileInputRef} id="payment-proof" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

                        {error && <p className="text-sm text-red-600">{error}</p>}
                    </div>
                </div>
            </div>
        </ModalShell>
    );
}
