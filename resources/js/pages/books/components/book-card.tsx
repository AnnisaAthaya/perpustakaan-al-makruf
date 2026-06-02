import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Book } from '@/types';
import { Link } from '@inertiajs/react';
import { Bookmark, LogIn, MapPin, Star } from 'lucide-react';
import { BookCover } from './book-cover';

export interface BookCardProps {
    book: Book;
    onShowDetail: (book: Book) => void;
    onBorrow: (book: Book) => void;
    onToggleFavorite: (bookId: number) => void;
    onToggleSave: (bookId: number) => void;
    isAuthenticated: boolean;
}

export function BookCard({ book, onShowDetail, onBorrow, onToggleFavorite, onToggleSave, isAuthenticated }: BookCardProps) {
    const isAvailable = book.available > 0;

    const handleToggleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleFavorite(book.id);
    };

    const handleToggleSave = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleSave(book.id);
    };

    return (
        <Card className="group overflow-hidden">
            <CardHeader className="">
                <div className="flex gap-4">
                    <div className="w-20 flex-shrink-0">
                        <BookCover title={book.title} category={book.category?.name} cover={book.cover} />
                    </div>

                    <div className="flex flex-1 flex-col gap-2">
                        <div>
                            <div className="flex items-start justify-between gap-2">
                                <Badge variant="secondary" className="mb-2 text-xs">
                                    {book.category?.name || 'Umum'}
                                </Badge>
                                {isAuthenticated && (
                                    <div className="flex gap-1">
                                        <TooltipProvider delayDuration={100}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        onClick={handleToggleFavorite}
                                                        className={`rounded-full p-1.5 transition-colors ${
                                                            book.is_favorited ? 'bg-primary text-white' : 'bg-secondary hover:bg-primary/10'
                                                        }`}
                                                    >
                                                        <Star size={14} className={book.is_favorited ? 'fill-current' : ''} />
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
                                                        className={`rounded-full p-1.5 transition-colors ${
                                                            book.is_saved ? 'bg-primary text-white' : 'bg-secondary hover:bg-primary/10'
                                                        }`}
                                                    >
                                                        <Bookmark size={14} className={book.is_saved ? 'fill-current' : ''} />
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
                            <h3 className="line-clamp-2 text-base leading-snug font-bold text-foreground">{book.title}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">{book.author}</p>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="">
                <Separator className="mb-3" />
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex flex-col">
                        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Jumlah Buku</span>
                        <span className="mt-0.5 font-semibold text-foreground">
                            <span className={isAvailable ? 'text-primary' : 'text-destructive'}>{book.available}</span>
                            <span className="text-muted-foreground"> / {book.stock} Buku</span>
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Lokasi</span>
                        <span className="mt-0.5 flex items-center gap-1.5 font-semibold text-foreground">
                            <MapPin size={14} className="text-primary" />
                            {book.location || '-'}
                        </span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => onShowDetail(book)}>
                    Lihat Detail
                </Button>
                {isAuthenticated ? (
                    isAvailable ? (
                        <Button size="sm" className="flex-1" onClick={() => onBorrow(book)}>
                            Pinjam Buku
                        </Button>
                    ) : (
                        <Button size="sm" variant="secondary" className="flex-1" disabled>
                            Tidak Tersedia
                        </Button>
                    )
                ) : (
                    <Button size="sm" className="flex-1" asChild>
                        <Link href="/auth/login">
                            <LogIn size={14} className="mr-1.5" />
                            Login
                        </Link>
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
