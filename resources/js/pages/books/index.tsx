import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MainLayout from '@/layouts/main-layout';
import type { Book, Category, PaginatedData, SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Book as BookIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import {
    BookCard,
    BookDetailDialog,
    BorrowBookDialog,
    BorrowResultDialog,
    CategoriesWidget,
    MobileCategoryFilter,
    MobileQuickFilter,
    MobileSearchBar,
    Pagination,
    QuickFiltersWidget,
    SearchWidget,
    type BorrowResultBook,
} from './components';

interface PageProps {
    books: PaginatedData<Book>;
    categories: Category[];
    filters: {
        search: string | null;
        category: string | null;
        quick_filter: string | null;
    };
    userStats?: {
        favorites_count: number;
        saved_count: number;
        borrowed_count: number;
    } | null;
}

export default function Index({ books, categories, filters, userStats }: PageProps) {
    const { auth } = usePage<SharedData>().props;
    const isAuthenticated = !!auth?.user;

    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [borrowBook, setBorrowBook] = useState<Book | null>(null);
    const [isBorrowDialogOpen, setIsBorrowDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // Borrow result dialog state
    const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
    const [borrowResult, setBorrowResult] = useState<{
        success: boolean;
        book: BorrowResultBook | null;
        message?: string;
    }>({ success: false, book: null });

    // Search handler
    const handleSearch = useCallback(
        (query: string) => {
            setIsSearching(true);
            router.get(
                '/books',
                {
                    search: query || undefined,
                    category: filters.category || undefined,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    onFinish: () => setIsSearching(false),
                },
            );
        },
        [filters.category],
    );

    const handleCategorySelect = useCallback(
        (categoryId: string | null) => {
            setIsSearching(true);
            router.get(
                '/books',
                {
                    search: filters.search || undefined,
                    category: categoryId || undefined,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    onFinish: () => setIsSearching(false),
                },
            );
        },
        [filters.search],
    );

    const handleQuickFilterSelect = useCallback(
        (filter: string | null) => {
            setIsSearching(true);
            router.get(
                '/books',
                {
                    search: filters.search || undefined,
                    quick_filter: filter || undefined,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    onFinish: () => setIsSearching(false),
                },
            );
        },
        [filters.search],
    );

    const handleShowDetail = (book: Book) => {
        setSelectedBook(book);
        setIsDialogOpen(true);
    };

    const handleBorrow = (book: Book) => {
        setIsDialogOpen(false);
        setBorrowBook(book);
        setIsBorrowDialogOpen(true);
    };

    const handleDirectBorrow = (book: Book) => {
        setBorrowBook(book);
        setIsBorrowDialogOpen(true);
    };

    const handleConfirmBorrow = (book: Book) => {
        setIsSubmitting(true);

        const bookForResult: BorrowResultBook = {
            id: book.id,
            title: book.title,
            author: book.author,
            category: book.category?.name || 'Umum',
            location: book.location || '-',
        };

        router.post(
            `/books/${book.id}/borrow`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSubmitting(false);
                    setIsBorrowDialogOpen(false);
                    setBorrowBook(null);

                    // Show success dialog
                    setBorrowResult({
                        success: true,
                        book: bookForResult,
                        message: `Buku "${book.title}" berhasil dipinjam. Silakan ambil buku di ${book.location || 'perpustakaan'}.`,
                    });
                    setIsResultDialogOpen(true);
                },
                onError: (errors) => {
                    setIsSubmitting(false);
                    setIsBorrowDialogOpen(false);
                    setBorrowBook(null);

                    const errorMessage = (errors.book as string) || 'Terjadi kesalahan saat memproses peminjaman.';

                    // Show error dialog
                    setBorrowResult({
                        success: false,
                        book: bookForResult,
                        message: errorMessage,
                    });
                    setIsResultDialogOpen(true);
                },
            },
        );
    };

    const handleClearFilters = useCallback(() => {
        setIsSearching(true);
        router.get('/books', {}, { preserveState: true, preserveScroll: true, replace: true, onFinish: () => setIsSearching(false) });
    }, []);

    const handleToggleFavorite = useCallback((bookId: number) => {
        router.post(
            `/books/${bookId}/favorite`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    }, []);

    const handleToggleSave = useCallback((bookId: number) => {
        router.post(
            `/books/${bookId}/save`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    }, []);

    const RightSidebarContent = () => (
        <>
            <SearchWidget value={filters.search || ''} onSearch={handleSearch} isSearching={isSearching} />
            {isAuthenticated && userStats && (
                <QuickFiltersWidget
                    activeFilter={filters.quick_filter}
                    onSelectFilter={handleQuickFilterSelect}
                    counters={{
                        favorites: userStats.favorites_count,
                        saved: userStats.saved_count,
                        history: userStats.borrowed_count,
                    }}
                    isAuthenticated={isAuthenticated}
                />
            )}
            <CategoriesWidget categories={categories} activeCategory={filters.category} onSelectCategory={handleCategorySelect} />
        </>
    );

    // Transform Book to dialog format
    const transformBookForDetailDialog = (book: Book | null) => {
        if (!book) return null;
        return {
            id: book.id,
            title: book.title,
            author: book.author,
            category: book.category?.name || 'Umum',
            total: book.stock,
            available: book.available,
            location: book.location || '-',
            cover: book.cover,
            description: book.description,
            isbn: book.isbn,
            publisher: book.publisher,
            year: book.year,
            is_favorited: book.is_favorited,
            is_saved: book.is_saved,
        };
    };

    const transformBookForBorrowDialog = (book: Book | null) => {
        if (!book) return null;
        return {
            id: book.id,
            title: book.title,
            author: book.author,
            category: book.category?.name || 'Umum',
            location: book.location || '-',
            available: book.available,
        };
    };

    return (
        <MainLayout rightSidebar={<RightSidebarContent />}>
            <Head title="Katalog Buku" />

            <div className="flex flex-col gap-5 pb-8">
                {/* Header Section */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-1.5 rounded-full bg-primary" />
                        <div>
                            <h1 className="text-xl font-bold text-foreground md:text-2xl">KATALOG BUKU</h1>
                            <p className="text-sm text-muted-foreground">Temukan dan pinjam buku favoritmu</p>
                        </div>
                    </div>

                    {/* Mobile Search & Filter */}
                    <div className="flex flex-col gap-3 lg:hidden">
                        <MobileSearchBar value={filters.search || ''} onSearch={handleSearch} isSearching={isSearching} />
                        {isAuthenticated && userStats && (
                            <MobileQuickFilter
                                activeFilter={filters.quick_filter}
                                onSelectFilter={handleQuickFilterSelect}
                                counters={{
                                    favorites: userStats.favorites_count,
                                    saved: userStats.saved_count,
                                    history: userStats.borrowed_count,
                                }}
                                isAuthenticated={isAuthenticated}
                            />
                        )}
                        <MobileCategoryFilter categories={categories} activeCategory={filters.category} onSelectCategory={handleCategorySelect} />
                    </div>
                </div>

                {/* Active Filters Indicator */}
                {(filters.search || filters.category || filters.quick_filter) && (
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span>Menampilkan hasil untuk:</span>
                        {filters.search && <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">"{filters.search}"</span>}
                        {filters.category && (
                            <span className="rounded-full bg-secondary px-3 py-1 font-medium text-foreground">
                                {categories.find((c) => c.id.toString() === filters.category)?.name || 'Kategori'}
                            </span>
                        )}
                        {filters.quick_filter && (
                            <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
                                {filters.quick_filter === 'favorites' && 'Favorit'}
                                {filters.quick_filter === 'saved' && 'Disimpan'}
                                {filters.quick_filter === 'history' && 'Riwayat'}
                            </span>
                        )}
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleClearFilters}>
                            Hapus Filter
                        </Button>
                    </div>
                )}

                {/* Books Grid */}
                {books.data.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {books.data.map((book) => (
                            <BookCard
                                key={book.id}
                                book={book}
                                onShowDetail={handleShowDetail}
                                onBorrow={handleDirectBorrow}
                                onToggleFavorite={handleToggleFavorite}
                                onToggleSave={handleToggleSave}
                                isAuthenticated={isAuthenticated}
                            />
                        ))}
                    </div>
                ) : (
                    <Card className="py-16 text-center">
                        <CardContent>
                            <BookIcon size={48} className="text-muted-foreground" />
                            <h3 className="text-lg font-semibold text-foreground">Tidak Ada Buku</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {filters.search || filters.category || filters.quick_filter
                                    ? 'Tidak ada buku yang sesuai dengan pencarian.'
                                    : 'Belum ada buku yang tersedia di katalog.'}
                            </p>
                            {(filters.search || filters.category || filters.quick_filter) && (
                                <Button variant="outline" className="mt-4" onClick={handleClearFilters}>
                                    Lihat Semua Buku
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Pagination with page info */}
                {books.data.length > 0 && (
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-sm text-muted-foreground">
                            Menampilkan {(books.current_page - 1) * books.per_page + 1} - {Math.min(books.current_page * books.per_page, books.total)}{' '}
                            dari {books.total} buku
                        </p>
                        <Pagination data={books} />
                    </div>
                )}
            </div>

            {/* Book Detail Dialog */}
            <BookDetailDialog
                book={transformBookForDetailDialog(selectedBook)}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onBorrow={() => selectedBook && handleBorrow(selectedBook)}
                onToggleFavorite={handleToggleFavorite}
                onToggleSave={handleToggleSave}
                isAuthenticated={isAuthenticated}
            />

            {/* Borrow Confirmation Dialog */}
            <BorrowBookDialog
                book={transformBookForBorrowDialog(borrowBook)}
                open={isBorrowDialogOpen}
                onOpenChange={setIsBorrowDialogOpen}
                onConfirm={() => borrowBook && handleConfirmBorrow(borrowBook)}
                isSubmitting={isSubmitting}
            />

            {/* Borrow Result Dialog (Success/Error) */}
            <BorrowResultDialog
                open={isResultDialogOpen}
                onOpenChange={setIsResultDialogOpen}
                success={borrowResult.success}
                book={borrowResult.book}
                message={borrowResult.message}
            />
        </MainLayout>
    );
}
