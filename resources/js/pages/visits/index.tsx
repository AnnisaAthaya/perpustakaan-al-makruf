import { Card, CardContent } from '@/components/ui/card';
import MainLayout from '@/layouts/main-layout';
import { LibraryVisit } from '@/types';
import { Head } from '@inertiajs/react';
import { VisitForm } from './components/visit-form';

interface PageProps {
    has_visited_today: boolean;
    today_visit: LibraryVisit | null;
    recent_visits: LibraryVisit[];
    user: {
        name: string;
        nis?: string;
        grade?: number;
        class_name?: string;
        full_class?: string;
    };
}

export default function Index({ has_visited_today, today_visit, user }: PageProps) {
    return (
        <MainLayout>
            <Head title="Isi Kunjungan" />

            <div className="flex flex-col gap-6 pb-8">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="h-8 w-1.5 rounded-full bg-primary" />
                    <div>
                        <h1 className="text-xl font-bold text-foreground md:text-2xl">ISI KUNJUNGAN PERPUSTAKAAN</h1>
                        <p className="text-sm text-muted-foreground">Catat kunjungan Anda ke perpustakaan hari ini</p>
                    </div>
                </div>

                {/* Visit Form */}
                <Card>
                    <CardContent className="p-6">
                        <VisitForm user={user} hasVisitedToday={has_visited_today} todayVisit={today_visit} />
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
