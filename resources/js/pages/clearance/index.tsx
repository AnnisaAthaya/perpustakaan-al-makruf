import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MainLayout from '@/layouts/main-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Download, FileCheck, Printer, XCircle } from 'lucide-react';

// Types
interface Requirement {
    id: string;
    label: string;
    description: string;
    isMet: boolean;
    detail?: string | null;
    actionLink?: string | null;
    actionLabel?: string;
}

interface ClearanceStatusData {
    isEligible: boolean;
    studentName: string;
    studentNis: string;
    studentClass: string;
    requirements: Requirement[];
    activeLoanCount: number;
    unpaidFineCount: number;
    unpaidFineTotal: number;
    lastUpdated: string;
}

interface PageProps {
    clearanceStatus: ClearanceStatusData;
}

function RequirementItem({ requirement }: { requirement: Requirement }) {
    return (
        <div className={`flex items-start gap-4 rounded-xl p-4 ${requirement.isMet ? 'bg-emerald-50' : 'bg-red-50'}`}>
            {requirement.isMet ? <CheckCircle2 size={20} className="text-emerald-600" /> : <XCircle size={20} className="text-red-600" />}
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <h3 className={`font-semibold ${requirement.isMet ? 'text-emerald-800' : 'text-red-800'}`}>{requirement.label}</h3>
                        <p className={`mt-0.5 text-sm ${requirement.isMet ? 'text-emerald-600' : 'text-red-600'}`}>{requirement.description}</p>
                        {requirement.detail && <p className="mt-1 text-sm font-medium text-red-700">{requirement.detail}</p>}
                    </div>
                    {!requirement.isMet && requirement.actionLink && (
                        <Button size="sm" variant="outline" className="shrink-0 border-red-200 text-red-700 hover:bg-red-100" asChild>
                            <Link href={requirement.actionLink}>{requirement.actionLabel}</Link>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

function EligibleStatusCard() {
    return null;
    return (
        <Card className="overflow-hidden border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
            <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                    <h2 className="text-xl font-bold text-emerald-800">Selamat! Anda Bebas Pustaka</h2>
                    <p className="mt-2 max-w-md text-sm text-emerald-600">
                        Semua persyaratan bebas pustaka telah terpenuhi. Anda dapat mencetak surat keterangan bebas pustaka untuk keperluan
                        administrasi.
                    </p>

                    {/* Action Buttons */}
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <Button className="gap-2">
                            <Download size={16} />
                            Unduh Surat Keterangan
                        </Button>
                        <Button variant="outline" className="gap-2">
                            <Printer size={16} />
                            Cetak Langsung
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function NotEligibleStatusCard() {
    return (
        <Card className="overflow-hidden border-2 border-red-200 from-red-50 to-white">
            <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                    <h2 className="text-xl font-bold text-red-800">Anda Belum Bebas Pustaka</h2>
                    <p className="mt-2 max-w-md text-sm text-red-600">
                        Masih ada persyaratan yang belum terpenuhi. Silakan selesaikan semua kewajiban di bawah untuk mendapatkan status bebas
                        pustaka.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

export default function Index() {
    const { clearanceStatus } = usePage<{ props: PageProps }>().props as unknown as PageProps;

    const allRequirementsMet = clearanceStatus.requirements.every((r) => r.isMet);

    return (
        <MainLayout>
            <Head title="Bebas Pustaka" />

            <div className="flex flex-col gap-6 pb-8">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="h-10 w-1.5 bg-primary" />
                    <div>
                        <h1 className="text-xl font-bold text-foreground md:text-2xl">BEBAS PUSTAKA</h1>
                        <p className="text-sm text-muted-foreground">Cek status kelengkapan administrasi perpustakaan Anda</p>
                    </div>
                </div>

                {/* Info Box */}
                <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <AlertCircle size={20} className="mt-0.5 shrink-0 text-blue-600" />
                    <div>
                        <p className="font-semibold text-blue-800">Informasi Bebas Pustaka</p>
                        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-blue-700">
                            <li>Surat keterangan bebas pustaka diperlukan untuk proses kelulusan atau pindah sekolah</li>
                            <li>Pastikan semua buku sudah dikembalikan dan denda sudah dilunasi</li>
                            <li>Surat keterangan dapat dicetak setelah semua persyaratan terpenuhi</li>
                            <li>Hubungi petugas perpustakaan jika ada kendala</li>
                        </ul>
                    </div>
                </div>

                {/* Status Card */}
                {allRequirementsMet && clearanceStatus.isEligible ? <EligibleStatusCard /> : <NotEligibleStatusCard />}

                {/* Requirements Checklist */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <FileCheck size={20} className="text-primary" />
                            Checklist Persyaratan
                        </CardTitle>
                        <CardDescription>Pastikan semua item di bawah ini terpenuhi untuk mendapatkan status bebas pustaka</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {clearanceStatus.requirements.map((requirement) => (
                                <RequirementItem key={requirement.id} requirement={requirement} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
