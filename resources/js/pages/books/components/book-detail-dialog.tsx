import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ModalShell } from '@/components/generated-components/modal-shell';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from '@inertiajs/react';
import { Bookmark, BookMarked, Building2, Calendar, Hash, LogIn, MapPin, Star, User } from 'lucide-react';
import { getCategoryColorSolid } from '@/lib/utils';

export interface BookDetailItem {
    id: number;
    title: string;
    author: string;
    category: string;
    total: number;
    available: number;
    location: string;
    cover?: string;
    rating?: number;
    description?: string;
    isbn?: string;
    publisher?: string;
    year?: number;
    is_favorited?: boolean;
    is_saved?: boolean;
}

interface BookDetailDialogProps {
    book: BookDetailItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onBorrow?: ((book: BookDetailItem) => void) | (() => void);
    onToggleFavorite?: (bookId: number) => void;
    onToggleSave?: (bookId: number) => void;
    isAuthenticated?: boolean;
}

function BookCoverLarge({ title, category }: { title: string; category: string }) {
    return (
        <div
            className={`shadow-soft lg:shadow-soft-lg flex aspect-[3/4] w-full max-w-[140px] flex-col items-center justify-center rounded-xl p-6 text-white ${getCategoryColorSolid(category)}`}
        >
            <BookMarked size={48} strokeWidth={1.5} className="mb-3 opacity-80" />
            <p className="line-clamp-3 text-center text-sm leading-tight font-semibold opacity-90">{title}</p>
        </div>
    );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
    return (
        <div className="flex items-start gap-3">
            <Icon size={20} className="text-primary" />
            <div className="flex flex-col">
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</span>
                <span className="text-sm font-semibold text-foreground">{value}</span>
            </div>
        </div>
    );
}

export function BookDetailDialog({
    book,
    open,
    onOpenChange,
    onBorrow,
    onToggleFavorite,
    onToggleSave,
    isAuthenticated = true,
}: BookDetailDialogProps) {
    if (!book) return null;

    const isAvailable = book.available > 0;

    const handleBorrow = () => {
        if (onBorrow && book) {
            onBorrow(book);
        }
    };

    const handleToggleFavorite = () => {
        if (onToggleFavorite && book) {
            onToggleFavorite(book.id);
        }
    };

    const handleToggleSave = () => {
        if (onToggleSave && book) {
            onToggleSave(book.id);
        }
    };

    return (
        <ModalShell
            open={open}
            onOpenChange={onOpenChange}
            title={book.title}
            description="Detail informasi buku"
            size="lg"
            footer={
                <>
                    <Button variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
                        Tutup
                    </Button>
                    {isAuthenticated ? (
                        isAvailable ? (
                            <Button className="w-full sm:flex-1" onClick={handleBorrow}>
                                <BookMarked size={16} className="mr-2" />
                                Pinjam Buku Ini
                            </Button>
                        ) : (
                            <Button variant="secondary" className="w-full sm:flex-1" disabled>
                                Buku Tidak Tersedia
                            </Button>
                        )
                    ) : (
                        <Button className="w-full sm:flex-1" asChild>
                            <Link href="/auth/login">
                                <LogIn size={16} className="mr-2" />
                                Login untuk Meminjam
                            </Link>
                        </Button>
                    )}
                </>
            }
        >
            <div className="flex flex-col gap-6 pr-2 max-h-[70vh] overflow-y-auto">
                {/* Hero Section */}
                <div className="flex gap-5">
                    <BookCoverLarge title={book.title} category={book.category} />
                    <div className="flex flex-1 flex-col justify-center gap-3">
                        <div>
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                    <Badge variant="secondary" className="mb-2">
                                        {book.category}
                                    </Badge>
                                    <h2 className="text-lg leading-snug font-bold text-foreground">{book.title}</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">{book.author}</p>
                                </div>
                                {isAuthenticated && onToggleFavorite && onToggleSave && (
                                    <div className="flex gap-1">
                                        <TooltipProvider delayDuration={100}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        onClick={handleToggleFavorite}
                                                        className={`rounded-full p-2 transition-colors ${
                                                            book.is_favorited ? 'bg-primary text-white' : 'bg-secondary hover:bg-primary/10'
                                                        }`}
                                                    >
                                                        <Star size={16} className={book.is_favorited ? 'fill-current' : ''} />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="text-sm">{book.is_favorited ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        <TooltipProvider delayDuration={100}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        onClick={handleToggleSave}
                                                        className={`rounded-full p-2 transition-colors ${
                                                            book.is_saved ? 'bg-primary text-white' : 'bg-secondary hover:bg-primary/10'
                                                        }`}
                                                    >
                                                        <Bookmark size={16} className={book.is_saved ? 'fill-current' : ''} />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="text-sm">{book.is_saved ? 'Hapus dari Simpanan' : 'Simpan Buku'}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                )}
                            </div>
                        </div>

                        {book.rating && (
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1">
                                    <Star size={14} className="fill-amber-400 text-amber-400" />
                                    <span className="text-sm font-bold text-amber-700">{book.rating}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">Rating</span>
                            </div>
                        )}

                        {/* Availability Badge */}
                        <div className="mt-1">
                            {isAvailable ? (
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                    {book.available} dari {book.total} tersedia
                                </Badge>
                            ) : (
                                <Badge variant="destructive">Tidak Tersedia</Badge>
                            )}
                        </div>
                    </div>
                </div>

                <Separator className="my-2" />

                {/* Description */}
                {book.description && (
                    <div className="space-y-2">
                        <h3 className="text-sm font-bold tracking-wide text-foreground uppercase">Sinopsis</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">{book.description}</p>
                    </div>
                )}

                {/* Book Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <InfoRow icon={MapPin} label="Lokasi" value={book.location} />
                    {book.isbn && <InfoRow icon={Hash} label="ISBN" value={book.isbn} />}
                    {book.publisher && <InfoRow icon={Building2} label="Penerbit" value={book.publisher} />}
                    {book.year && <InfoRow icon={Calendar} label="Tahun" value={book.year} />}
                    <InfoRow icon={User} label="Penulis" value={book.author} />
                </div>
            </div>
        </ModalShell>
    );
}
