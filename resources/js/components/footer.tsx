import Logo from '@/components/logo';
import { Mail, MapPin } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto bg-card">
            {/* Main Footer Content */}
            <div className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6 md:py-12">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {/* Brand Section */}
                    <div>
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-1.5">
                                <Logo size={32} className="h-full w-full object-contain" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">MA AL-MA'RUF</h3>
                                <p className="text-xs text-muted-foreground">Perpustakaan Digital</p>
                            </div>
                        </div>
                        <p className="max-w-md leading-relaxed text-muted-foreground">
                            Sistem informasi perpustakaan digital MA Al-Ma'ruf Margodadi yang memudahkan siswa dalam mengakses dan meminjam buku
                            secara online.
                        </p>
                    </div>

                    {/* About Section */}
                    <div>
                        <h3 className="mb-4 text-xs font-bold tracking-wider text-foreground uppercase">TENTANG KAMI</h3>
                        <div className="mb-4 h-1 w-12 rounded-full bg-primary"></div>
                        <p className="max-w-md leading-relaxed text-muted-foreground">
                            Perpustakaan MA Al-Ma'ruf Margodadi berkomitmen menyediakan layanan literasi digital terbaik untuk mendukung kegiatan
                            belajar mengajar civitas akademika.
                        </p>
                    </div>

                    {/* Contact Section */}
                    <div>
                        <h3 className="mb-4 text-xs font-bold tracking-wider text-foreground uppercase">KONTAK KAMI</h3>
                        <div className="mb-4 h-1 w-12 rounded-full bg-primary"></div>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 text-muted-foreground">
                                <MapPin size={18} className="mt-0.5 flex-shrink-0 text-primary" />
                                <span>Jl. Raya Margodadi, Kec. Seyegan, Kab. Sleman</span>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Mail size={18} className="flex-shrink-0 text-primary" />
                                <span>perpustakaan@maalmaruf.sch.id</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright Bar */}
            <div className="border-t border-border bg-secondary/50 py-4">
                <p className="text-center text-sm text-muted-foreground">
                    &copy; {currentYear} Perpustakaan MA Al-Ma'ruf Margodadi. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
