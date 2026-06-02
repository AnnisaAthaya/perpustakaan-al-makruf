import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AdminLayout from '@/layouts/admin/admin-layout';
import { Head, useForm } from '@inertiajs/react';
import { Check, Eye, EyeOff, Key, Loader2, Mail, Save, Shield, User } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface AdminUser {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

interface ProfileProps {
    user: AdminUser;
}

interface ProfileFormData {
    name: string;
    email: string;
}

interface PasswordFormData {
    current_password: string;
    password: string;
    password_confirmation: string;
}

export default function ProfilePage({ user }: ProfileProps) {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Profile form
    const profileForm = useForm<ProfileFormData>({
        name: user.name,
        email: user.email,
    });

    // Password form
    const passwordForm = useForm<PasswordFormData>({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleProfileSubmit = (e: FormEvent) => {
        e.preventDefault();
        profileForm.put('/admin/profile', {
            preserveScroll: true,
        });
    };

    const handlePasswordSubmit = (e: FormEvent) => {
        e.preventDefault();
        passwordForm.put('/admin/profile/password', {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
            },
        });
    };

    const userInitials = user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const memberSince = new Date(user.created_at).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <AdminLayout>
            <Head title="Profil Admin" />

            <div className="mx-auto max-w-3xl space-y-6">
                {/* Page Header */}
                <div className="flex items-center gap-4">
                    <User className="size-6 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Profil Saya</h1>
                        <p className="mt-0.5 text-muted-foreground">Kelola informasi profil dan keamanan akun</p>
                    </div>
                </div>

                {/* Profile Overview Card */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col items-center gap-6 sm:flex-row">
                            <Avatar className="h-24 w-24 border-4 border-primary/20">
                                <AvatarFallback className="bg-primary text-2xl font-bold text-white">{userInitials}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-center sm:text-left">
                                <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
                                <p className="mt-1 text-muted-foreground">{user.email}</p>
                                <div className="mt-3 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                        <Shield size={12} />
                                        Administrator
                                    </span>
                                    <span className="text-xs text-muted-foreground">Bergabung sejak {memberSince}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Profile Card */}
                <Card>
                    <CardHeader className="border-b border-border pb-6">
                        <div className="flex items-center gap-3">
                            <User className="size-7 shrink-0 text-primary" />
                            <div>
                                <CardTitle>Informasi Profil</CardTitle>
                                <CardDescription>Perbarui nama dan email akun Anda</CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-6">
                        <form onSubmit={handleProfileSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Nama Lengkap <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="Masukkan nama lengkap"
                                    value={profileForm.data.name}
                                    onChange={(e) => profileForm.setData('name', e.target.value)}
                                    aria-invalid={!!profileForm.errors.name}
                                />
                                {profileForm.errors.name && <p className="text-sm text-destructive">{profileForm.errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    Email <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="email@contoh.com"
                                        className="pl-10"
                                        value={profileForm.data.email}
                                        onChange={(e) => profileForm.setData('email', e.target.value)}
                                        aria-invalid={!!profileForm.errors.email}
                                    />
                                </div>
                                {profileForm.errors.email && <p className="text-sm text-destructive">{profileForm.errors.email}</p>}
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button type="submit" disabled={profileForm.processing} className="gap-2">
                                    {profileForm.processing ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : profileForm.recentlySuccessful ? (
                                        <>
                                            <Check size={18} />
                                            Tersimpan
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Simpan Profil
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Change Password Card */}
                <Card>
                    <CardHeader className="border-b border-border pb-6">
                        <div className="flex items-center gap-3">
                            <Key className="size-7 shrink-0 text-amber-600" />
                            <div>
                                <CardTitle>Ubah Password</CardTitle>
                                <CardDescription>Pastikan akun Anda menggunakan password yang kuat</CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-6">
                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                            {/* Current Password */}
                            <div className="space-y-2">
                                <Label htmlFor="current_password">
                                    Password Saat Ini <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="current_password"
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        placeholder="Masukkan password saat ini"
                                        value={passwordForm.data.current_password}
                                        onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                        aria-invalid={!!passwordForm.errors.current_password}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {passwordForm.errors.current_password && (
                                    <p className="text-sm text-destructive">{passwordForm.errors.current_password}</p>
                                )}
                            </div>

                            <Separator />

                            {/* New Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    Password Baru <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showNewPassword ? 'text' : 'password'}
                                        placeholder="Masukkan password baru"
                                        value={passwordForm.data.password}
                                        onChange={(e) => passwordForm.setData('password', e.target.value)}
                                        aria-invalid={!!passwordForm.errors.password}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {passwordForm.errors.password && <p className="text-sm text-destructive">{passwordForm.errors.password}</p>}
                                <p className="text-xs text-muted-foreground">Minimal 8 karakter</p>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">
                                    Konfirmasi Password Baru <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password_confirmation"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Ulangi password baru"
                                        value={passwordForm.data.password_confirmation}
                                        onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                        aria-invalid={!!passwordForm.errors.password_confirmation}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {passwordForm.errors.password_confirmation && (
                                    <p className="text-sm text-destructive">{passwordForm.errors.password_confirmation}</p>
                                )}
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button type="submit" disabled={passwordForm.processing} variant="outline" className="gap-2">
                                    {passwordForm.processing ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Mengubah...
                                        </>
                                    ) : passwordForm.recentlySuccessful ? (
                                        <>
                                            <Check size={18} />
                                            Password Diubah
                                        </>
                                    ) : (
                                        <>
                                            <Key size={18} />
                                            Ubah Password
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
