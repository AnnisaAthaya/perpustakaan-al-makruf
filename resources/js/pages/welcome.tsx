import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import MainLayout from '@/layouts/main-layout';
import { SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, Eye, Flag, LogIn } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const isAuthenticated = !!auth?.user;

    return (
        <MainLayout>
            <Head title="Selamat Datang" />

            <div className="flex flex-col gap-6">
                {/* Hero Card */}
                <Card className="overflow-hidden">
                    <CardContent className="p-6 text-center md:p-10">
                        <h1 className="text-3xl font-bold text-foreground md:text-4xl">SELAMAT DATANG</h1>
                        <p className="mt-2 text-lg text-muted-foreground">Perpustakaan MA Al-Ma'ruf Margodadi</p>
                        <div className="mx-auto mt-4 h-1.5 w-24 rounded-full bg-primary"></div>

                        <div className="mt-8 overflow-hidden rounded-2xl">
                            <div className="h-64 w-full bg-secondary md:h-80">
                                <img
                                    src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                    alt="Library Interior"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>

                        <p className="mx-auto mt-8 max-w-2xl leading-relaxed text-muted-foreground">
                            Perpustakaan MA Al-Ma'ruf Margodadi adalah sistem informasi perpustakaan yang menyediakan berbagai koleksi buku dan
                            referensi untuk mendukung kegiatan belajar mengajar. Kami berkomitmen untuk menyediakan akses informasi yang mudah dan
                            cepat bagi seluruh civitas akademika.
                        </p>

                        {/* CTA Buttons */}
                        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <Button size="lg" asChild>
                                <Link href="/books">
                                    <BookOpen size={18} className="mr-2" />
                                    Lihat Katalog Buku
                                </Link>
                            </Button>
                            {!isAuthenticated && (
                                <Button size="lg" variant="outline" asChild>
                                    <Link href="/auth/login">
                                        <LogIn size={18} className="mr-2" />
                                        Login Siswa
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Vision & Mission Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Vision Card */}
                    <Card className="bg-secondary/30">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                                <Eye className="text-primary" size={24} />
                                <CardTitle className="text-xl">VISI</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <Separator className="mb-4" />
                            <p className="leading-relaxed text-muted-foreground">
                                Meningkatkan minat baca dan literasi siswa untuk mencetak generasi cerdas dan berwawasan luas.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Mission Card */}
                    <Card className="bg-secondary/30">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                                <Flag className="text-primary" size={24} />
                                <CardTitle className="text-xl">MISI</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <Separator className="mb-4" />
                            <ul className="list-disc space-y-2 pl-5 leading-relaxed text-muted-foreground">
                                <li>Menyediakan koleksi buku yang relevan dan berkualitas.</li>
                                <li>Memberikan pelayanan perpustakaan yang ramah dan profesional.</li>
                                <li>Menciptakan lingkungan baca yang nyaman dan kondusif.</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
