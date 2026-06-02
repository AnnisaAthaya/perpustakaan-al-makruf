import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import GuestLayout from '@/layouts/guest-layout';
import { Head, useForm } from '@inertiajs/react';
import { AlertTriangle, BookOpen, Eye, EyeOff, KeyRound, Lock, ShieldCheck } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface ChangePasswordPageProps {
    user: {
        name: string;
        nis: string;
    };
}

interface PasswordRequirement {
    label: string;
    met: boolean;
}

export default function ChangePasswordPage({ user }: ChangePasswordPageProps) {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const passwordRequirements: PasswordRequirement[] = [
        { label: 'Minimal 8 karakter', met: data.password.length >= 8 },
        { label: 'Mengandung huruf', met: /[a-zA-Z]/.test(data.password) },
        { label: 'Mengandung angka', met: /[0-9]/.test(data.password) },
    ];

    const allRequirementsMet = passwordRequirements.every((req) => req.met);
    const passwordsMatch = data.password === data.password_confirmation && data.password_confirmation.length > 0;

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put('/auth/change-password');
    };

    return (
        <GuestLayout showFooter={false}>
            <Head title="Ubah Password" />

            <div className="flex min-h-[80vh] items-center justify-center py-6">
                <div className="w-full max-w-lg">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="mb-4 flex justify-center">
                            <BookOpen size={48} className="text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Selamat Datang, {user.name}!</h1>
                        <p className="mt-2 text-muted-foreground">NIS: {user.nis}</p>
                    </div>

                    {/* Alert Card */}
                    <Card className="mb-6 border-amber-200 bg-amber-50">
                        <CardContent className="flex items-start gap-4 pt-6">
                            <AlertTriangle size={20} className="text-amber-600" />
                            <div>
                                <h3 className="font-semibold text-amber-800">Perhatian!</h3>
                                <p className="mt-1 text-sm text-amber-700">
                                    Ini adalah login pertama Anda. Demi keamanan akun, silakan ubah password default Anda sebelum melanjutkan.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Change Password Form */}
                    <Card>
                        <CardHeader className="text-center">
                            <div className="mb-2 flex justify-center">
                                <KeyRound size={24} className="text-primary" />
                            </div>
                            <CardTitle>Ubah Password</CardTitle>
                            <CardDescription>Buat password baru yang kuat untuk akun Anda</CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Current Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="current_password">Password Saat Ini</Label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                            <Lock size={18} className="text-muted-foreground" />
                                        </div>
                                        <Input
                                            id="current_password"
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            placeholder="Masukkan password default"
                                            value={data.current_password}
                                            onChange={(e) => setData('current_password', e.target.value)}
                                            className="pr-11 pl-11"
                                            aria-invalid={!!errors.current_password}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        >
                                            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Password default adalah tanggal lahir Anda (format: ddmmyyyy)</p>
                                    {errors.current_password && <p className="text-sm text-destructive">{errors.current_password}</p>}
                                </div>

                                <Separator />

                                {/* New Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password Baru</Label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                            <KeyRound size={18} className="text-muted-foreground" />
                                        </div>
                                        <Input
                                            id="password"
                                            type={showNewPassword ? 'text' : 'password'}
                                            placeholder="Masukkan password baru"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="pr-11 pl-11"
                                            aria-invalid={!!errors.password}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}

                                    {/* Password Requirements */}
                                    {data.password.length > 0 && (
                                        <div className="mt-3 space-y-2 rounded-xl bg-secondary/50 p-3">
                                            <p className="text-xs font-medium text-muted-foreground">Syarat password:</p>
                                            {passwordRequirements.map((req, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <div
                                                        className={`flex h-4 w-4 items-center justify-center rounded-full ${req.met ? 'bg-emerald-500' : 'bg-muted'}`}
                                                    >
                                                        {req.met && <ShieldCheck size={10} className="text-white" />}
                                                    </div>
                                                    <span className={`text-xs ${req.met ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                                                        {req.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Konfirmasi Password Baru</Label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                            <ShieldCheck size={18} className="text-muted-foreground" />
                                        </div>
                                        <Input
                                            id="password_confirmation"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="Ulangi password baru"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            className="pr-11 pl-11"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {data.password_confirmation.length > 0 && (
                                        <p className={`text-xs ${passwordsMatch ? 'text-emerald-600' : 'text-destructive'}`}>
                                            {passwordsMatch ? 'Password cocok' : 'Password tidak cocok'}
                                        </p>
                                    )}
                                </div>

                                <Button type="submit" disabled={processing || !allRequirementsMet || !passwordsMatch} size="lg" className="w-full">
                                    {processing ? 'Memproses...' : 'Ubah Password & Lanjutkan'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </GuestLayout>
    );
}
