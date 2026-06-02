import { Card, CardContent } from '@/components/ui/card';
import { LibraryVisit } from '@/types';
import { AlertCircle, CheckCircle2, Clock, FileText } from 'lucide-react';

interface VisitStatusCardProps {
    hasVisitedToday: boolean;
    todayVisit: LibraryVisit | null;
}

export function VisitStatusCard({ hasVisitedToday, todayVisit }: VisitStatusCardProps) {
    if (hasVisitedToday && todayVisit) {
        return (
            <Card className="border-emerald-500 bg-emerald-50">
                <CardContent className="p-4">
                    <div className="flex gap-3">
                        <div className="flex-shrink-0">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-emerald-800">Kunjungan Hari Ini Sudah Tercatat</p>
                            <div className="mt-2 space-y-1 text-sm text-emerald-700">
                                <div className="flex items-center gap-2">
                                    <Clock size={14} />
                                    <span>
                                        Waktu: <span className="font-medium">{todayVisit.time}</span>
                                    </span>
                                </div>
                                {todayVisit.notes && (
                                    <div className="flex items-start gap-2">
                                        <FileText size={14} className="mt-0.5 flex-shrink-0" />
                                        <span>
                                            Keterangan: <span className="font-medium">{todayVisit.notes}</span>
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-amber-500 bg-amber-50">
            <CardContent className="p-4">
                <div className="flex gap-3">
                    <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-amber-800">Belum Mengisi Kunjungan Hari Ini</p>
                        <p className="mt-1 text-sm text-amber-700">Silakan isi formulir di bawah untuk mencatat kunjungan Anda ke perpustakaan.</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
