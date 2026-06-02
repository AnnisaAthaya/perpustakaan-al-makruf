import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import MainLayout from '@/layouts/main-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Calendar, CheckCircle2, Edit3, GraduationCap, IdCard, Lock, Mail, Phone, Save, Shield, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';

// Types
interface ProfileData {
    id: number;
    name: string;
    nis: string;
    email: string;
    phone: string;
    class: string;
    address: string;
    avatar: string | null;
    memberSince: string;
    totalLoans: number;
    activeLoans: number;
    membershipStatus: 'active' | 'inactive' | 'suspended';
    passwordChangedAt: string | null;
}

interface PageProps {
    profile: ProfileData;
    flash?: {
        success?: string;
        error?: string;
    };
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
    return (
        <div className="flex items-start gap-4 py-3">
            <Icon size={18} className="text-primary" />
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <p className="mt-0.5 font-semibold text-foreground">{value || '-'}</p>
            </div>
        </div>
    );
}

interface EditProfileDialogProps {
    profile: ProfileData;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function EditProfileDialog({ profile, open, onOpenChange }: EditProfileDialogProps) {
    const [formData, setFormData] = useState({
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Reset form when profile changes
    useEffect(() => {
        setFormData({
            name: profile.name,
            phone: profile.phone,
            address: profile.address,
        });
    }, [profile]);

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        setErrors({});

        router.put('/settings/profile', formData, {
            onSuccess: () => {
                setIsSubmitting(false);
                onOpenChange(false);
            },
            onError: (errors) => {
                setIsSubmitting(false);
                setErrors(errors as Record<string, string>);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Edit3 size={20} className="text-primary" />
                        Edit Profil
                    </DialogTitle>
                    <DialogDescription>Perbarui informasi profil Anda. Klik simpan setelah selesai.</DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-4">
                    {/* Read-only info */}
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <p className="mb-2 text-sm font-medium text-amber-800">Informasi yang tidak dapat diubah: NIS, Email, Kelas</p>
                        <p className="mt-2 text-xs text-amber-600">Hubungi admin perpustakaan untuk mengubah data ini.</p>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="Masukkan nama lengkap"
                            />
                            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Nomor Telepon</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                placeholder="Masukkan nomor telepon"
                            />
                            {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Alamat</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                placeholder="Masukkan alamat lengkap"
                            />
                            {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col gap-2 sm:flex-row">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="w-full sm:w-auto">
                        <X size={16} className="mr-2" />
                        Batal
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:flex-1">
                        {isSubmitting ? (
                            <>
                                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <Save size={16} className="mr-2" />
                                Simpan Perubahan
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface ChangePasswordDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
    const [formData, setFormData] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        setErrors({});

        router.put('/settings/password', formData, {
            onSuccess: () => {
                setIsSubmitting(false);
                onOpenChange(false);
                setFormData({ current_password: '', password: '', password_confirmation: '' });
            },
            onError: (errors) => {
                setIsSubmitting(false);
                setErrors(errors as Record<string, string>);
            },
        });
    };

    const handleClose = () => {
        setFormData({ current_password: '', password: '', password_confirmation: '' });
        setErrors({});
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lock size={20} className="text-primary" />
                        Ubah Password
                    </DialogTitle>
                    <DialogDescription>Masukkan password lama dan password baru Anda.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="current_password">Password Saat Ini</Label>
                        <Input
                            id="current_password"
                            type="password"
                            value={formData.current_password}
                            onChange={(e) => handleChange('current_password', e.target.value)}
                            placeholder="Masukkan password saat ini"
                        />
                        {errors.current_password && <p className="text-sm text-red-600">{errors.current_password}</p>}
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <Label htmlFor="password">Password Baru</Label>
                        <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            placeholder="Masukkan password baru"
                        />
                        {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">Konfirmasi Password Baru</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={formData.password_confirmation}
                            onChange={(e) => handleChange('password_confirmation', e.target.value)}
                            placeholder="Ulangi password baru"
                        />
                        {errors.password_confirmation && <p className="text-sm text-red-600">{errors.password_confirmation}</p>}
                    </div>

                    <div className="rounded-lg bg-blue-50 p-3">
                        <p className="text-sm font-medium text-blue-800">Ketentuan Password:</p>
                        <ul className="mt-1 list-inside list-disc text-xs text-blue-700">
                            <li>Minimal 8 karakter</li>
                            <li>Disarankan kombinasi huruf, angka, dan simbol</li>
                        </ul>
                    </div>
                </div>

                <DialogFooter className="flex-col gap-2 sm:flex-row">
                    <Button variant="outline" onClick={handleClose} disabled={isSubmitting} className="w-full sm:w-auto">
                        Batal
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:flex-1">
                        {isSubmitting ? (
                            <>
                                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <Lock size={16} className="mr-2" />
                                Ubah Password
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function Index() {
    const { profile, flash } = usePage<{ props: PageProps }>().props as unknown as PageProps;
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            setSuccessMessage(flash.success);
            const timer = setTimeout(() => setSuccessMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash?.success]);

    return (
        <MainLayout>
            <Head title="Pengaturan" />

            <div className="flex flex-col gap-6 pb-8">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="h-8 w-1.5 rounded-full bg-primary" />
                    <div>
                        <h1 className="text-xl font-bold text-foreground md:text-2xl">PENGATURAN</h1>
                        <p className="text-sm text-muted-foreground">Kelola profil dan pengaturan akun Anda</p>
                    </div>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                        <CheckCircle2 size={20} className="text-emerald-600" />
                        <p className="font-medium text-emerald-800">{successMessage}</p>
                        <button onClick={() => setSuccessMessage(null)} className="ml-auto rounded-lg p-1 hover:bg-emerald-100">
                            <X size={16} className="text-emerald-600" />
                        </button>
                    </div>
                )}

                {/* Profile Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between gap-2 text-lg">
                            <div>
                                <User size={20} className="text-primary" />
                                Informasi Pribadi
                            </div>

                            {/* Edit Button */}
                            <Button onClick={() => setIsEditDialogOpen(true)}>
                                <Edit3 size={16} className="mr-2" />
                                Edit Profil
                            </Button>
                        </CardTitle>

                        <CardDescription>Detail informasi akun dan profil Anda</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y divide-border">
                            <InfoRow icon={User} label="Nama Lengkap" value={profile.name} />
                            <InfoRow icon={IdCard} label="NIS (Nomor Induk Siswa)" value={profile.nis} />
                            <InfoRow icon={GraduationCap} label="Kelas" value={profile.class} />
                            <InfoRow icon={Mail} label="Email" value={profile.email} />
                            <InfoRow icon={Phone} label="Nomor Telepon" value={profile.phone} />
                            <InfoRow icon={Calendar} label="Tanggal Bergabung" value={formatDate(profile.memberSince)} />
                            <InfoRow icon={IdCard} label="Alamat" value={profile.address} />
                        </div>
                    </CardContent>
                </Card>

                {/* Security Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Shield size={20} className="text-primary" />
                            Keamanan Akun
                        </CardTitle>
                        <CardDescription>Kelola keamanan dan akses akun Anda</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h4 className="font-semibold text-foreground">Password</h4>
                                <p className="text-sm text-muted-foreground">
                                    Terakhir diubah: {profile.passwordChangedAt ? formatDateTime(profile.passwordChangedAt) : 'Belum pernah diubah'}
                                </p>
                            </div>
                            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)}>
                                <Lock size={16} className="mr-2" />
                                Ubah Password
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Edit Profile Dialog */}
            <EditProfileDialog profile={profile} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />

            {/* Change Password Dialog */}
            <ChangePasswordDialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen} />
        </MainLayout>
    );
}
