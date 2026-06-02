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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin/admin-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, RotateCcw, Save, UserCog } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface User {
    id: number;
    name: string;
    nis: string;
    email: string;
    date_of_birth: string | null;
    phone: string | null;
    grade: number | null;
    class_name: string | null;
    address: string | null;
    membership_status: string;
    is_using_default_password: boolean;
}

interface MembershipStatus {
    value: string;
    label: string;
}

interface EditUserProps {
    user: User;
    membershipStatuses: MembershipStatus[];
}

interface UserFormData {
    name: string;
    nis: string;
    email: string;
    date_of_birth: string;
    phone: string;
    grade: string;
    class_name: string;
    address: string;
    membership_status: string;
    password: string;
    reset_password: boolean;
}

const gradeOptions = [
    { value: '10', label: 'Kelas X' },
    { value: '11', label: 'Kelas XI' },
    { value: '12', label: 'Kelas XII' },
];

export default function EditUser({ user, membershipStatuses }: EditUserProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);

    const [isResetting, setIsResetting] = useState(false);

    const { data, setData, put, processing, errors } = useForm<UserFormData>({
        name: user.name,
        nis: user.nis,
        email: user.email,
        date_of_birth: user.date_of_birth || '',
        phone: user.phone || '',
        grade: user.grade?.toString() || '',
        class_name: user.class_name || '',
        address: user.address || '',
        membership_status: user.membership_status,
        password: '',
        reset_password: false,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/admin/users/${user.id}`);
    };

    const handleResetPasswordConfirm = () => {
        setResetPasswordDialogOpen(false);
        setIsResetting(true);
        // Submit with reset_password flag using router
        router.put(
            `/admin/users/${user.id}`,
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
        if (!dateStr) return 'ddmmyyyy';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'ddmmyyyy';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}${month}${year}`;
    };

    const getMembershipStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'text-emerald-600';
            case 'inactive':
                return 'text-gray-500';
            case 'suspended':
                return 'text-red-600';
            default:
                return 'text-foreground';
        }
    };

    return (
        <AdminLayout>
            <Head title={`Edit Siswa - ${user.name}`} />

            <div className="mx-auto max-w-2xl space-y-6">
                {/* Page Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/users"
                        className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Edit Data Siswa</h1>
                        <p className="mt-0.5 text-muted-foreground">
                            Mengubah data <span className="font-medium text-foreground">{user.name}</span>
                        </p>
                    </div>
                </div>

                {/* Form Card */}
                <Card>
                    <CardHeader className="border-b border-border pb-6">
                        <div className="flex items-center gap-3">
                            <UserCog className="size-7 shrink-0 text-primary" />
                            <div>
                                <CardTitle>Informasi Siswa</CardTitle>
                                <CardDescription>Perbarui data siswa sesuai kebutuhan</CardDescription>
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
                                    placeholder="Masukkan nama lengkap siswa"
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
                                        NIS <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="nis"
                                        placeholder="Nomor Induk Siswa"
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
                                        placeholder="email@contoh.com"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        aria-invalid={!!errors.email}
                                    />
                                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                                </div>
                            </div>

                            {/* Grade & Class Name Row */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="grade">
                                        Tingkat Kelas <span className="text-destructive">*</span>
                                    </Label>
                                    <Select value={data.grade} onValueChange={(value) => setData('grade', value)}>
                                        <SelectTrigger id="grade" aria-invalid={!!errors.grade}>
                                            <SelectValue placeholder="Pilih kelas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {gradeOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.grade && <p className="text-sm text-destructive">{errors.grade}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="class_name">
                                        Nama Kelas <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="class_name"
                                        placeholder="Contoh: IPA 1, IPS 2"
                                        value={data.class_name}
                                        onChange={(e) => setData('class_name', e.target.value)}
                                        aria-invalid={!!errors.class_name}
                                    />
                                    {errors.class_name && <p className="text-sm text-destructive">{errors.class_name}</p>}
                                </div>
                            </div>

                            {/* Date of Birth & Phone Row */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="date_of_birth">
                                        Tanggal Lahir <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="date_of_birth"
                                        type="date"
                                        value={data.date_of_birth}
                                        onChange={(e) => setData('date_of_birth', e.target.value)}
                                        aria-invalid={!!errors.date_of_birth}
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                    {errors.date_of_birth && <p className="text-sm text-destructive">{errors.date_of_birth}</p>}
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
                                    placeholder="Masukkan alamat lengkap siswa (opsional)"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    aria-invalid={!!errors.address}
                                    rows={3}
                                />
                                {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                            </div>

                            {/* Membership Status */}
                            <div className="space-y-2">
                                <Label htmlFor="membership_status">
                                    Status Keanggotaan <span className="text-destructive">*</span>
                                </Label>
                                <Select value={data.membership_status} onValueChange={(value) => setData('membership_status', value)}>
                                    <SelectTrigger id="membership_status" aria-invalid={!!errors.membership_status}>
                                        <SelectValue placeholder="Pilih status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {membershipStatuses.map((status) => (
                                            <SelectItem key={status.value} value={status.value}>
                                                <span className={getMembershipStatusColor(status.value)}>{status.label}</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.membership_status && <p className="text-sm text-destructive">{errors.membership_status}</p>}
                                <p className="text-xs text-muted-foreground">Siswa dengan status "Ditangguhkan" tidak dapat meminjam buku.</p>
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
                                className={`rounded-xl border p-4 ${user.is_using_default_password ? 'border-amber-500/30 bg-amber-500/5' : 'border-primary/20 bg-primary/5'}`}
                            >
                                <div className="flex gap-3">
                                    <KeyRound size={16} className={user.is_using_default_password ? 'text-amber-600' : 'text-primary'} />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-foreground">
                                            {user.is_using_default_password ? 'Menggunakan Password Default' : 'Password Sudah Diubah'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {user.is_using_default_password
                                                ? 'Siswa ini masih menggunakan password default (tanggal lahir). Siswa akan diminta mengubah password saat login.'
                                                : 'Siswa ini sudah mengubah password dari password default.'}
                                        </p>
                                        {data.date_of_birth && (
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                Password default:{' '}
                                                <span className="font-mono font-medium text-foreground">
                                                    {formatPasswordPreview(data.date_of_birth)}
                                                </span>
                                            </p>
                                        )}
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
                                    Mereset password ke tanggal lahir ({formatPasswordPreview(data.date_of_birth)})
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
                                    <Link href="/admin/users">Batal</Link>
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
                            Password siswa <span className="font-semibold text-foreground">"{user.name}"</span> akan direset ke password default yaitu
                            tanggal lahir dengan format{' '}
                            <span className="font-mono font-semibold text-foreground">{formatPasswordPreview(data.date_of_birth)}</span>.
                            <br />
                            <br />
                            Siswa akan diminta untuk mengubah password saat login berikutnya.
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
