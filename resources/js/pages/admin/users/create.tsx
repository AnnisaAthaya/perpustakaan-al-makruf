import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin/admin-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Info, Loader2, UserPlus } from 'lucide-react';
import { FormEvent } from 'react';

interface UserFormData {
    name: string;
    nis: string;
    email: string;
    date_of_birth: string;
    phone: string;
    grade: string;
    class_name: string;
    address: string;
}

const gradeOptions = [
    { value: '10', label: 'Kelas X' },
    { value: '11', label: 'Kelas XI' },
    { value: '12', label: 'Kelas XII' },
];

export default function CreateUser() {
    const { data, setData, post, processing, errors } = useForm<UserFormData>({
        name: '',
        nis: '',
        email: '',
        date_of_birth: '',
        phone: '',
        grade: '',
        class_name: '',
        address: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/users');
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

    return (
        <AdminLayout>
            <Head title="Tambah Siswa" />

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
                        <h1 className="text-2xl font-bold text-foreground">Tambah Siswa Baru</h1>
                        <p className="mt-0.5 text-muted-foreground">Isi formulir berikut untuk mendaftarkan siswa baru</p>
                    </div>
                </div>

                {/* Form Card */}
                <Card>
                    <CardHeader className="border-b border-border pb-6">
                        <div className="flex items-center gap-3">
                            <UserPlus className="size-7 shrink-0 text-primary" />
                            <div>
                                <CardTitle>Informasi Siswa</CardTitle>
                                <CardDescription>Masukkan data siswa yang akan didaftarkan</CardDescription>
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

                            {/* Password Info Box */}
                            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                                <div className="flex gap-3">
                                    <Info size={20} className="text-primary" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-foreground">Password Default</p>
                                        <p className="text-sm text-muted-foreground">
                                            Password default siswa adalah <span className="font-medium text-foreground">tanggal lahir</span> dengan
                                            format <span className="font-mono text-primary">ddmmyyyy</span>
                                        </p>
                                        {data.date_of_birth && (
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                Contoh password:{' '}
                                                <span className="font-mono font-medium text-primary">
                                                    {formatPasswordPreview(data.date_of_birth)}
                                                </span>
                                            </p>
                                        )}
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            Siswa akan diminta untuk mengubah password saat pertama kali login.
                                        </p>
                                    </div>
                                </div>
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
                                            <UserPlus size={18} />
                                            Simpan Siswa
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
