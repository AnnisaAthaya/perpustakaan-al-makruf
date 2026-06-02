import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import GuestLayout from '@/layouts/guest-layout';
import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, IdCard, Info, Lock } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface GuideStep {
    number: number;
    text: string;
}

const guideSteps: GuideStep[] = [
    {
        number: 1,
        text: 'Silakan hubungi admin perpustakaan untuk mendapatkan akun login.',
    },
    {
        number: 2,
        text: 'Gunakan NIS atau Email yang terdaftar untuk masuk ke sistem.',
    },
    {
        number: 3,
        text: 'Password default adalah tanggal lahir Anda (format: ddmmyyyy). Contoh: 15012005',
    },
];

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        identifier: '',
        password: '',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/auth/login');
    };

    return (
        <GuestLayout showFooter={false}>
            <Head title="Login" />

            {/* Main Content */}
            <div className="grid grid-cols-1 items-start gap-8 py-6 lg:grid-cols-2 lg:gap-12">
                {/* Left Section - Welcome Info */}
                <div className="space-y-8">
                    {/* Hero Section */}
                    <div>
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white p-2">
                                <Logo size={40} className="h-full w-full object-contain" />
                            </div>
                            <span className="text-xl font-bold text-primary">MA AL-MA'RUF</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Selamat Datang di Perpustakaan Digital</h1>
                        <p className="mt-3 text-lg text-muted-foreground">Akses ribuan koleksi buku dan kelola peminjaman dengan mudah.</p>
                    </div>

                    {/* Panduan Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Info size={20} className="text-primary" />
                                <div>
                                    <CardTitle>Panduan Login</CardTitle>
                                    <CardDescription>Ikuti langkah berikut untuk masuk</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {guideSteps.map((step, index) => (
                                <div key={step.number}>
                                    <div className="flex gap-4">
                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border-2 border-primary text-sm font-bold text-primary">
                                            {step.number}
                                        </div>
                                        <p className="pt-1 leading-relaxed text-muted-foreground">{step.text}</p>
                                    </div>
                                    {index < guideSteps.length - 1 && <Separator className="mt-5" />}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Section - Login Form */}
                <Card className="lg:sticky lg:top-24">
                    <CardHeader className="text-center">
                        {/* Lock Icon */}
                        <div className="mb-4 flex justify-center">
                            <Lock size={48} className="text-primary" />
                        </div>
                        <CardTitle className="text-2xl tracking-wider uppercase">Login</CardTitle>
                        <CardDescription>Masuk ke akun perpustakaan Anda</CardDescription>
                    </CardHeader>

                    <CardContent>
                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="identifier">NIS / Email</Label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                        <IdCard size={18} className="text-muted-foreground" />
                                    </div>
                                    <Input
                                        id="identifier"
                                        type="text"
                                        placeholder="Masukkan NIS atau Email"
                                        value={data.identifier}
                                        onChange={(e) => setData('identifier', e.target.value)}
                                        className="pl-11"
                                        aria-invalid={!!errors.identifier}
                                        autoComplete="username"
                                    />
                                </div>
                                {errors.identifier && <p className="text-sm text-destructive">{errors.identifier}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                        <Lock size={18} className="text-muted-foreground" />
                                    </div>
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Masukkan password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="pr-11 pl-11"
                                        aria-invalid={!!errors.password}
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                            </div>

                            <Button type="submit" disabled={processing} size="lg" className="w-full">
                                {processing ? 'Memproses...' : 'Masuk'}
                            </Button>
                        </form>

                        <Separator className="my-6" />

                        {/* Info Text */}
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                Belum memiliki akun? <span className="font-semibold text-primary">Hubungi Admin Perpustakaan</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </GuestLayout>
    );
}
