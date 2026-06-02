import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LibraryVisit } from '@/types';
import { router } from '@inertiajs/react';
import { Loader2, Send } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface VisitFormProps {
    user: {
        name: string;
        nis?: string;
        grade?: number;
        class_name?: string;
        full_class?: string;
    };
    hasVisitedToday: boolean;
    todayVisit: LibraryVisit | null;
}

export function VisitForm({ user, hasVisitedToday, todayVisit }: VisitFormProps) {
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const today = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        setIsSubmitting(true);
        router.post(
            '/visits',
            { notes: notes.trim() || null },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNotes('');
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            },
        );
    };

    // Jika sudah isi kunjungan hari ini, tampilkan success message
    if (hasVisitedToday && todayVisit) {
        return (
            <div className="space-y-6 text-center">
                <div>
                    <h3 className="text-lg font-bold text-foreground">Kunjungan Hari Ini Sudah Tercatat</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Anda telah mengisi kunjungan perpustakaan pada <span className="font-medium text-foreground">{today}</span>
                    </p>
                    {todayVisit.time && (
                        <p className="mt-1 text-sm text-muted-foreground">
                            Waktu: <span className="font-medium text-foreground">{todayVisit.time}</span>
                        </p>
                    )}
                    {todayVisit.notes && (
                        <div className="mt-4 rounded-lg bg-muted p-4 text-left">
                            <p className="text-xs font-medium text-muted-foreground">Keterangan:</p>
                            <p className="mt-1 text-sm text-foreground">{todayVisit.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nama Lengkap */}
            <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-foreground">
                    Nama Lengkap
                </Label>
                <Input id="name" type="text" value={user.name} disabled className="bg-muted" />
            </div>

            {/* NIS */}
            {user.nis && (
                <div className="space-y-2">
                    <Label htmlFor="nis" className="text-sm font-medium text-foreground">
                        NIS
                    </Label>
                    <Input id="nis" type="text" value={user.nis} disabled className="bg-muted" />
                </div>
            )}

            {/* Kelas */}
            {user.full_class && (
                <div className="space-y-2">
                    <Label htmlFor="class" className="text-sm font-medium text-foreground">
                        Kelas
                    </Label>
                    <Input id="class" type="text" value={user.full_class} disabled className="bg-muted" />
                </div>
            )}

            {/* Tanggal Kunjungan */}
            <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium text-foreground">
                    Tanggal Kunjungan
                </Label>
                <Input id="date" type="text" value={today} disabled className="bg-muted" />
            </div>

            {/* Keterangan */}
            <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium text-foreground">
                    Keterangan <span className="text-xs text-muted-foreground">(Opsional)</span>
                </Label>
                <Textarea
                    id="notes"
                    placeholder="Tulis keterangan kunjungan Anda (maksimal 500 karakter)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={500}
                    rows={4}
                    className="resize-none"
                />
                <p className="text-xs text-muted-foreground">{notes.length}/500 karakter</p>
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
                {isSubmitting ? (
                    <>
                        <Loader2 size={18} className="mr-2 animate-spin" />
                        Menyimpan...
                    </>
                ) : (
                    <>
                        <Send size={18} className="mr-2" />
                        Simpan Kunjungan
                    </>
                )}
            </Button>
        </form>
    );
}
