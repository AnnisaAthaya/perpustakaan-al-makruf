import { BookMarked } from 'lucide-react';

interface BookCoverProps {
    title: string;
    category?: string;
    cover?: string;
}

function getCategoryColor(category?: string): string {
    const colors: Record<string, string> = {
        Sains: 'from-emerald-500 to-emerald-700',
        Matematika: 'from-blue-500 to-blue-700',
        'B. Inggris': 'from-amber-500 to-amber-700',
        'B. Indonesia': 'from-rose-500 to-rose-700',
        Sejarah: 'from-purple-500 to-purple-700',
        Agama: 'from-teal-500 to-teal-700',
        Fiksi: 'from-pink-500 to-pink-700',
        Referensi: 'from-slate-500 to-slate-700',
    };
    return colors[category || ''] || 'from-emerald-600 to-emerald-800';
}

export function BookCover({ title, category, cover }: BookCoverProps) {
    if (cover) {
        return (
            <div className="aspect-[3/4] w-full overflow-hidden rounded shadow-md">
                <img src={`/storage/${cover}`} alt={title} className="h-full w-full object-cover" />
            </div>
        );
    }

    return (
        <div
            className={`flex aspect-[3/4] w-full flex-col items-center justify-center rounded bg-gradient-to-br p-4 text-white shadow-md ${getCategoryColor(category)}`}
        >
            <BookMarked size={32} strokeWidth={1.5} className="mb-2 opacity-80" />
        </div>
    );
}

export { getCategoryColor };
