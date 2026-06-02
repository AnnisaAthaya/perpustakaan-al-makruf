import { ImportDialog } from '@/components/admin/import-dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ServerTable } from '@/components/ui/server-table';
import AdminLayout from '@/layouts/admin/admin-layout';
import type { PaginatedData } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { AlertTriangle, BookOpen, Pencil, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';

interface Book {
    id: number;
    title: string;
    code: string;
    publisher: string;
    language: string;
    description: string;
    isbn: string;
    stock: number;
    available: number;
    cover: string | null;
}

interface BooksIndexProps {
    books: PaginatedData<Book>;
    filters: {
        search?: string;
    };
}

export default function BooksIndex({ books, filters }: BooksIndexProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [importDialogOpen, setImportDialogOpen] = useState(false);

    const handleDeleteClick = (book: Book) => {
        setBookToDelete(book);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (!bookToDelete) return;

        setIsDeleting(true);
        router.delete(`/admin/books/${bookToDelete.id}`, {
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setBookToDelete(null);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    const columns: ColumnDef<Book>[] = [
        {
            id: 'no',
            header: 'No',
            cell: ({ row }) => <span className="font-medium">{row.index + 1}.</span>,
        },
        {
            accessorKey: 'cover',
            header: 'Cover',
            cell: ({ row }) => {
                const cover = row.original.cover;
                return cover ? (
                    <img src={cover} alt={row.original.title} className="shadow-soft h-14 w-10 rounded-lg object-cover" />
                ) : (
                    <BookOpen size={20} className="text-muted-foreground" />
                );
            },
        },
        {
            accessorKey: 'title',
            header: 'Judul Seri',
            cell: ({ row }) => (
                <div className="max-w-sm">
                    <p className="font-medium text-wrap text-foreground">{row.original.title}</p>
                    <p className="text-xs text-wrap text-muted-foreground">{row.original.code}</p>
                </div>
            ),
        },
        {
            accessorKey: 'publisher',
            header: 'Penerbit',
        },
        {
            accessorKey: 'language',
            header: 'Bahasa',
        },
        {
            accessorKey: 'description',
            header: 'Deskripsi Fisik',
        },
        {
            accessorKey: 'isbn',
            header: 'ISBN/ISSN',
        },
        {
            id: 'availability',
            header: 'Ketersediaan',
            cell: ({ row }) => {
                const { stock, available } = row.original;
                const isLow = available === 0;
                return (
                    <div className="text-center">
                        <span className={`font-semibold ${isLow ? 'text-destructive' : 'text-primary'}`}>{available}</span>
                        <span className="text-muted-foreground">/{stock}</span>
                    </div>
                );
            },
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => {
                const book = row.original;

                return (
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="xs"
                            className="text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                            onClick={() => router.visit(`/admin/books/${book.id}/edit`)}
                        >
                            <Pencil size={12} />
                            Edit
                        </Button>
                        <Button
                            variant="ghost"
                            size="xs"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteClick(book)}
                        >
                            <Trash2 size={12} />
                            Hapus
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <AdminLayout>
            <Head title="Kelola Buku" />

            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Data Buku</h1>
                    <p className="mt-1 text-muted-foreground">Kelola semua data buku perpustakaan</p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 sm:flex-row">
                    <Button variant="outline" onClick={() => setImportDialogOpen(true)} className="w-full gap-2 sm:w-auto">
                        <Upload size={18} />
                        Import CSV
                    </Button>
                    <Button onClick={() => router.visit('/admin/books/create')} className="w-full gap-2 sm:w-auto">
                        <BookOpen size={18} />
                        Tambah Data Buku
                    </Button>
                </div>

                {/* Data Table */}
                <ServerTable
                    columns={columns}
                    data={books}
                    searchPlaceholder="Cari buku (judul, author, ISBN, kode)..."
                    searchValue={filters.search}
                    routePath="/admin/books"
                />
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertTriangle className="size-7 text-destructive" />
                        <AlertDialogTitle>Hapus Buku?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Anda akan menghapus buku <span className="font-semibold text-foreground">"{bookToDelete?.title}"</span>. Tindakan ini
                            tidak dapat dibatalkan dan akan menghapus semua data terkait buku ini.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Menghapus...' : 'Ya, Hapus Buku'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Import Dialog */}
            <ImportDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                title="Import Data Buku"
                description="Upload file CSV untuk mengimport data buku secara massal"
                actionUrl="/admin/import/books"
                templateInstructions={[
                    'Kolom 1: Judul Buku (wajib)',
                    'Kolom 4: ISBN',
                    'Kolom 5: Penerbit',
                    'Kolom 6: Tahun Terbit',
                    'Kolom 9: Kode Klasifikasi DDC',
                    'Kolom 11: Kota Terbit',
                    'Kolom 16: Penulis (format: <NAMA PENULIS>)',
                    'Kolom 18: Kode Buku untuk perhitungan stok (format: <KODE1><KODE2>...)',
                ]}
            />
        </AdminLayout>
    );
}
