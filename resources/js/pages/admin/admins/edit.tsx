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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin/admin-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, RotateCcw, Save, Shield } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Admin {
    id: number;
    name: string;
    nis: string;
    email: string;
    date_of_birth: string | null;
    phone: string | null;
    address: string | null;
    is_using_default_password: boolean;
}

interface EditAdminProps {
    admin: Admin;
}

interface AdminFormData {
    name: string;
    nis: string;
    email: string;
    date_of_birth: string;
    phone: string;
    address: string;
    password: string;
    reset_password: boolean;
}

export default function EditAdmin({ admin }: EditAdminProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);

    const [isResetting, setIsResetting] = useState(false);

    const { data, setData, put, processing, errors } = useForm<AdminFormData>({
        name: admin.name,
        nis: admin.nis,
        email: admin.email,
        date_of_birth: admin.date_of_birth || '',
        phone: admin.phone || '',
        address: admin.address || '',
        password: '',
        reset_password: false,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/admin/admins/${admin.id}`);
    };

    const handleResetPasswordConfirm = () => {
        setResetPasswordDialogOpen(false);
        setIsResetting(true);
        // Submit with reset_password flag using router
        router.put(
            `/admin/admins/${admin.id}`,
            {
                ...data,
                reset_password: true,
            },
            {
                preserveScroll: true,
                onFinish: () => setIsResetting(false),
            },
        );
    };

    // Format date for display in info box
    const formatPasswordPreview = (dateStr: string): string => {
        if (!dateStr) return 'almaruf2024';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'almaruf2024';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}${month}${year}`;
    };

    return (
        <AdminLayout>
            <Head title={`Edit Admin - ${admin.name}`} />

            <div className="mx-auto max-w-2xl space-y-6">
                {/* Page Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/admins"
                        className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Edit Data Admin/Guru</h1>
                        <p className="mt-0.5 text-muted-foreground">
                            Mengubah data <span className="font-medium text-foreground">{admin.name}</span>
                        </p>
                    </div>
                </div>

                {/* Form Card */}
                <Card>
                    <CardHeader className="border-b border-border pb-6">
                        <div className="flex items-center gap-3">
                            <Shield className="size-7 shrink-0 text-primary" />
                            <div>
                                <CardTitle>Informasi Admin/Guru</CardTitle>
                                <CardDescription>Perbarui data admin/guru sesuai kebutuhan</CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Nama Lengkap <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="Masukkan nama lengkap admin/guru"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    aria-invalid={!!errors.name}
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>

                            {/* NIS & Email Row */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="nis">
                                        NIS/NIP <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="nis"
                                        placeholder="Nomor Induk"
                                        value={data.nis}
                                        onChange={(e) => setData('nis', e.target.value)}
                                        aria-invalid={!!errors.nis}
                                    />
                                    {errors.nis && <p className="text-sm text-destructive">{errors.nis}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">
                                        Email <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="email@staff.almaruf.sch.id"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        aria-invalid={!!errors.email}
                                    />
                                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                                </div>
                            </div>

                            {/* Date of Birth & Phone Row */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="date_of_birth">Tanggal Lahir</Label>
                                    <Input
                                        id="date_of_birth"
                                        type="date"
                                        value={data.date_of_birth}
                                        onChange={(e) => setData('date_of_birth', e.target.value)}
                                        aria-invalid={!!errors.date_of_birth}
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                    {errors.date_of_birth && <p className="text-sm text-destructive">{errors.date_of_birth}</p>}
                                    <p className="text-xs text-muted-foreground">Opsional. Digunakan sebagai password default jika diisi.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Nomor HP</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="08xxxxxxxxxx"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        aria-invalid={!!errors.phone}
                                    />
                                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                                </div>
                            </div>

                            {/* Address */}
                            <div className="space-y-2">
                                <Label htmlFor="address">Alamat</Label>
                                <Textarea
                                    id="address"
                                    placeholder="Masukkan alamat lengkap (opsional)"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    aria-invalid={!!errors.address}
                                    rows={3}
                                />
                                {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                            </div>

                            {/* Divider */}
                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-card px-3 text-sm text-muted-foreground">Pengaturan Password</span>
                                </div>
                            </div>

                            {/* Password Status Info */}
                            <div
                                className={`rounded-xl border p-4 ${admin.is_using_default_password ? 'border-amber-500/30 bg-amber-500/5' : 'border-primary/20 bg-primary/5'}`}
                            >
                                <div className="flex gap-3">
                                    <KeyRound size={16} className={admin.is_using_default_password ? 'text-amber-600' : 'text-primary'} />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-foreground">
                                            {admin.is_using_default_password ? 'Menggunakan Password Default' : 'Password Sudah Diubah'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {admin.is_using_default_password
                                                ? 'Admin/Guru ini masih menggunakan password default. Akan diminta mengubah password saat login.'
                                                : 'Admin/Guru ini sudah mengubah password dari password default.'}
                                        </p>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            Password default:{' '}
                                            <span className="font-mono font-medium text-foreground">{formatPasswordPreview(data.date_of_birth)}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Reset Password Button */}
                            <div className="flex items-center gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => setResetPasswordDialogOpen(true)}
                                    disabled={processing || isResetting}
                                >
                                    <RotateCcw size={14} />
                                    Reset ke Password Default
                                </Button>
                                <span className="text-xs text-muted-foreground">
                                    Mereset password ke default ({formatPasswordPreview(data.date_of_birth)})
                                </span>
                            </div>

                            {/* Custom Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Password Baru (Kustom)</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Kosongkan jika tidak ingin mengubah"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        aria-invalid={!!errors.password}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                                <p className="text-xs text-muted-foreground">
                                    Isi jika ingin mengubah password ke password kustom. Minimal 8 karakter.
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/admin/admins">Batal</Link>
                                </Button>
                                <Button type="submit" disabled={processing} className="gap-2">
                                    {processing ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Simpan Perubahan
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Reset Password Confirmation Dialog */}
            <AlertDialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <RotateCcw className="size-7 text-amber-600" />
                        <AlertDialogTitle>Reset Password ke Default?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Password admin/guru <span className="font-semibold text-foreground">"{admin.name}"</span> akan direset ke password default
                            yaitu <span className="font-mono font-semibold text-foreground">{formatPasswordPreview(data.date_of_birth)}</span>.
                            <br />
                            <br />
                            Admin/Guru akan diminta untuk mengubah password saat login berikutnya.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isResetting}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleResetPasswordConfirm}
                            disabled={isResetting}
                            className="bg-amber-600 text-white hover:bg-amber-700"
                        >
                            {isResetting ? 'Mereset...' : 'Ya, Reset Password'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}
