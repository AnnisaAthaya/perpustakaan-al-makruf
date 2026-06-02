import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/admin/admin-layout';
import { Head, useForm } from '@inertiajs/react';
import { Calendar, ImagePlus, Loader2, QrCode, Save, Settings2, Wallet, X } from 'lucide-react';
import { ChangeEvent, FormEvent, useRef, useState } from 'react';

interface SettingsData {
    fine_per_day: number;
    loan_duration_days: number;
    qris_image: string | null;
}

interface SettingsProps {
    settings: SettingsData;
}

interface SettingsFormData {
    fine_per_day: number;
    loan_duration_days: number;
    qris_image: File | null;
    remove_qris: boolean;
}

export default function SettingsPage({ settings }: SettingsProps) {
    const [qrisPreview, setQrisPreview] = useState<string | null>(settings.qris_image);
    const [isNewQris, setIsNewQris] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm<SettingsFormData>({
        fine_per_day: settings.fine_per_day,
        loan_duration_days: settings.loan_duration_days,
        qris_image: null,
        remove_qris: false,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/settings', {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const handleQrisChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('qris_image', file);
            setData('remove_qris', false);
            setIsNewQris(true);
            const reader = new FileReader();
            reader.onloadend = () => {
                setQrisPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeQris = () => {
        setData('qris_image', null);
        setData('remove_qris', true);
        setQrisPreview(null);
        setIsNewQris(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <AdminLayout>
            <Head title="Pengaturan" />

            <div className="mx-auto max-w-3xl space-y-6">
                {/* Page Header */}
                <div className="flex items-center gap-4">
                    <Settings2 className="size-6 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Pengaturan Sistem</h1>
                        <p className="mt-0.5 text-muted-foreground">Konfigurasi pengaturan perpustakaan</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Loan Settings Card */}
                    <Card>
                        <CardHeader className="border-b border-border pb-6">
                            <div className="flex items-center gap-3">
                                <Calendar className="size-7 shrink-0 text-primary" />
                                <div>
                                    <CardTitle>Pengaturan Peminjaman</CardTitle>
                                    <CardDescription>Atur durasi peminjaman buku</CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="loan_duration_days">
                                    Durasi Peminjaman <span className="text-destructive">*</span>
                                </Label>
                                <div className="flex items-center gap-3">
                                    <Input
                                        id="loan_duration_days"
                                        type="number"
                                        min={1}
                                        max={30}
                                        className="w-24"
                                        value={data.loan_duration_days}
                                        onChange={(e) => setData('loan_duration_days', parseInt(e.target.value) || 1)}
                                        aria-invalid={!!errors.loan_duration_days}
                                    />
                                    <span className="text-muted-foreground">hari</span>
                                </div>
                                {errors.loan_duration_days && <p className="text-sm text-destructive">{errors.loan_duration_days}</p>}
                                <p className="text-xs text-muted-foreground">
                                    Buku yang dipinjam harus dikembalikan dalam waktu {data.loan_duration_days} hari
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Fine Settings Card */}
                    <Card>
                        <CardHeader className="border-b border-border pb-6">
                            <div className="flex items-center gap-3">
                                <Wallet className="size-7 shrink-0 text-amber-600" />
                                <div>
                                    <CardTitle>Pengaturan Denda</CardTitle>
                                    <CardDescription>Atur nominal denda keterlambatan</CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fine_per_day">
                                        Denda per Hari <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <span className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">Rp</span>
                                            <Input
                                                id="fine_per_day"
                                                type="number"
                                                min={0}
                                                step={500}
                                                className="w-40 pl-10"
                                                value={data.fine_per_day}
                                                onChange={(e) => setData('fine_per_day', parseInt(e.target.value) || 0)}
                                                aria-invalid={!!errors.fine_per_day}
                                            />
                                        </div>
                                        <span className="text-muted-foreground">/ hari</span>
                                    </div>
                                    {errors.fine_per_day && <p className="text-sm text-destructive">{errors.fine_per_day}</p>}
                                </div>

                                {/* Fine Calculation Preview */}
                                <div className="rounded-xl border border-border bg-muted/50 p-4">
                                    <p className="mb-3 text-sm font-medium text-foreground">Contoh Perhitungan Denda:</p>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Terlambat 1 hari:</span>
                                            <span className="font-medium text-foreground">{formatCurrency(data.fine_per_day * 1)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Terlambat 3 hari:</span>
                                            <span className="font-medium text-foreground">{formatCurrency(data.fine_per_day * 3)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Terlambat 7 hari:</span>
                                            <span className="font-medium text-amber-600">{formatCurrency(data.fine_per_day * 7)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* QRIS Settings Card */}
                    <Card>
                        <CardHeader className="border-b border-border pb-6">
                            <div className="flex items-center gap-3">
                                <QrCode className="size-7 shrink-0 text-blue-600" />
                                <div>
                                    <CardTitle>QRIS Pembayaran</CardTitle>
                                    <CardDescription>Gambar QRIS untuk pembayaran denda oleh siswa</CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <Label>Gambar QRIS</Label>
                                <div className="flex flex-col items-start gap-4 sm:flex-row">
                                    {qrisPreview ? (
                                        <div className="relative">
                                            <img
                                                src={qrisPreview}
                                                alt="QRIS Preview"
                                                className="h-48 w-48 rounded-xl border border-border bg-white object-contain p-2 shadow-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeQris}
                                                className="absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full bg-destructive text-white shadow-md transition-transform hover:scale-110"
                                            >
                                                <X size={16} />
                                            </button>
                                            {isNewQris && (
                                                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-white">
                                                    Baru
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex h-48 w-48 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/50 text-muted-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
                                        >
                                            <ImagePlus size={32} />
                                            <span className="text-sm font-medium">Upload QRIS</span>
                                        </button>
                                    )}
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleQrisChange} className="hidden" />
                                    <div className="flex-1 space-y-2">
                                        <p className="text-sm text-muted-foreground">
                                            Upload gambar QRIS statis dari bank atau e-wallet Anda untuk menerima pembayaran denda dari siswa.
                                        </p>
                                        <ul className="list-inside list-disc space-y-1 text-xs text-muted-foreground">
                                            <li>Format: JPG, PNG, atau WebP</li>
                                            <li>Ukuran maksimal: 2MB</li>
                                            <li>Pastikan QRIS terlihat jelas dan tidak buram</li>
                                        </ul>
                                        {qrisPreview && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="mt-2"
                                            >
                                                <ImagePlus size={16} className="mr-2" />
                                                Ganti Gambar
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                {errors.qris_image && <p className="text-sm text-destructive">{errors.qris_image}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                        <div>{recentlySuccessful && <p className="text-sm font-medium text-primary">Pengaturan berhasil disimpan!</p>}</div>
                        <Button type="submit" disabled={processing} className="gap-2">
                            {processing ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Simpan Pengaturan
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
