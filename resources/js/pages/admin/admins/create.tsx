import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin/admin-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Info, Loader2, ShieldPlus } from 'lucide-react';
import { FormEvent } from 'react';

interface AdminFormData {
    name: string;
    nis: string;
    email: string;
    date_of_birth: string;
    phone: string;
    address: string;
}

export default function CreateAdmin() {
    const { data, setData, post, processing, errors } = useForm<AdminFormData>({
        name: '',
        nis: '',
        email: '',
        date_of_birth: '',
        phone: '',
        address: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/admins');
    };

    // Format date for password preview
    const formatPasswordPreview = (dateStr: string): string => {
        if (!dateStr) return 'ddmmyyyy atau almaruf2024';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'almaruf2024';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}${month}${year}`;
    };

    return (
        <AdminLayout>
            <Head title="Tambah Admin" />

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
                        <h1 className="text-2xl font-bold text-foreground">Tambah Admin/Guru Baru</h1>
                        <p className="mt-0.5 text-muted-foreground">Isi formulir berikut untuk mendaftarkan admin atau guru baru</p>
                    </div>
                </div>

                {/* Form Card */}
                <Card>
                    <CardHeader className="border-b border-border pb-6">
                        <div className="flex items-center gap-3">
                            <ShieldPlus className="size-7 shrink-0 text-primary" />
                            <div>
                                <CardTitle>Informasi Admin/Guru</CardTitle>
                                <CardDescription>Masukkan data admin atau guru yang akan didaftarkan</CardDescription>
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
                                    placeholder="Masukkan nama lengkap"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
                                    autoFocus
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>

                            {/* NIS/NIP */}
                            <div className="space-y-2">
                                <Label htmlFor="nis">
                                    NIS/NIP <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="nis"
                                    placeholder="Masukkan NIS/NIP"
                                    value={data.nis}
                                    onChange={(e) => setData('nis', e.target.value)}
                                    className={errors.nis ? 'border-destructive focus-visible:ring-destructive' : ''}
                                />
                                {errors.nis && <p className="text-sm text-destructive">{errors.nis}</p>}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    Email <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="contoh@staff.almaruf.sch.id"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                                />
                                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                            </div>

                            {/* Date of Birth */}
                            <div className="space-y-2">
                                <Label htmlFor="date_of_birth">Tanggal Lahir</Label>
                                <Input
                                    id="date_of_birth"
                                    type="date"
                                    value={data.date_of_birth}
                                    onChange={(e) => setData('date_of_birth', e.target.value)}
                                    className={errors.date_of_birth ? 'border-destructive focus-visible:ring-destructive' : ''}
                                />
                                {errors.date_of_birth && <p className="text-sm text-destructive">{errors.date_of_birth}</p>}
                                <p className="text-xs text-muted-foreground">Optional - akan digunakan sebagai password default</p>
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <Label htmlFor="phone">Nomor HP</Label>
                                <Input
                                    id="phone"
                                    placeholder="08xxxxxxxxxx"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className={errors.phone ? 'border-destructive focus-visible:ring-destructive' : ''}
                                />
                                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                            </div>

                            {/* Address */}
                            <div className="space-y-2">
                                <Label htmlFor="address">Alamat</Label>
                                <Textarea
                                    id="address"
                                    placeholder="Masukkan alamat lengkap"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    className={errors.address ? 'border-destructive focus-visible:ring-destructive' : ''}
                                    rows={3}
                                />
                                {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                            </div>

                            {/* Password Info Box */}
                            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                                <div className="flex gap-3">
                                    <Info size={18} className="text-blue-600" />
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-semibold text-blue-900">Informasi Password</p>
                                        <p className="text-sm text-blue-700">
                                            Password default:{' '}
                                            <span className="font-mono font-semibold">{formatPasswordPreview(data.date_of_birth)}</span>
                                        </p>
                                        <p className="text-xs text-blue-600">
                                            {data.date_of_birth
                                                ? 'Password dibuat dari tanggal lahir (format: ddmmyyyy)'
                                                : 'Jika tanggal lahir tidak diisi, password default: almaruf2024'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 pt-4">
                                <Button type="submit" disabled={processing} className="gap-2">
                                    {processing ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <ShieldPlus size={18} />
                                            Simpan Admin
                                        </>
                                    )}
                                </Button>
                                <Button type="button" variant="ghost" disabled={processing} asChild>
                                    <Link href="/admin/admins">Batal</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
