import { Card, CardContent } from '@/components/ui/card';
import { LibraryVisit } from '@/types';
import { Calendar, FileText, History } from 'lucide-react';

interface VisitHistoryProps {
    visits: LibraryVisit[];
}

export function VisitHistory({ visits }: VisitHistoryProps) {
    if (visits.length === 0) {
        return (
            <Card>
                <CardContent className="py-16 text-center">
                    <History size={48} className="text-muted-foreground" />
                    <h3 className="text-lg font-semibold text-foreground">Belum Ada Riwayat</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Riwayat kunjungan Anda akan muncul di sini</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2">
                    <History size={20} className="text-primary" />
                    <h2 className="text-lg font-bold text-foreground">Riwayat Kunjungan</h2>
                    <span className="ml-auto text-sm text-muted-foreground">10 Terakhir</span>
                </div>

                <div className="space-y-3">
                    {visits.map((visit) => (
                        <div
                            key={visit.id}
                            className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
                        >
                            <div className="flex-shrink-0">
                                <Calendar size={18} className="text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="font-semibold text-foreground">{visit.visited_at_formatted}</p>
                                    <span className="text-xs text-muted-foreground sm:text-sm">Pukul {visit.time}</span>
                                </div>
                                {visit.notes && (
                                    <div className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                                        <FileText size={14} className="mt-0.5 flex-shrink-0" />
                                        <p className="line-clamp-2">{visit.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
