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
import { PaginatedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { AlertTriangle, FolderOpen, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Category {
    id: number;
    name: string;
    books_count: number;
}

interface CategoriesIndexProps {
    categories: PaginatedData<Category>;
    filters: {
        search?: string;
    };
}

export default function CategoriesIndex({ categories, filters }: CategoriesIndexProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (category: Category) => {
        setCategoryToDelete(category);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (!categoryToDelete) return;

        setIsDeleting(true);
        router.delete(`/admin/categories/${categoryToDelete.id}`, {
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setCategoryToDelete(null);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    const handleAddCategory = () => {
        router.visit('/admin/categories/create');
    };

    // Table columns definition
    const columns: ColumnDef<Category>[] = [
        {
            accessorKey: 'name',
            header: 'Nama Kategori',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <FolderOpen className="size-7 shrink-0 text-primary" />
                    <div>
                        <p className="font-medium text-foreground">{row.original.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {row.original.books_count} {row.original.books_count === 1 ? 'buku' : 'buku'}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'books_count',
            header: 'Jumlah Buku',
            cell: ({ row }) => <span className="font-semibold text-foreground">{row.original.books_count}</span>,
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild className="gap-2">
                        <Link href={`/admin/categories/${row.original.id}/edit`}>
                            <Pencil size={14} />
                            Edit
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(row.original)}
                        className="hover:text-destructive-foreground gap-2 text-destructive hover:bg-destructive"
                        disabled={row.original.books_count > 0}
                    >
                        <Trash2 size={14} />
                        Hapus
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AdminLayout>
            <Head title="Kelola Kategori" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Kelola Kategori</h1>
                        <p className="mt-1 text-muted-foreground">Manajemen kategori buku perpustakaan</p>
                    </div>
                </div>

                {/* ServerTable Component */}
                <ServerTable
                    columns={columns}
                    data={categories}
                    searchPlaceholder="Cari nama kategori..."
                    searchValue={filters.search}
                    addButtonLabel="Tambah Kategori"
                    onAdd={handleAddCategory}
                    routePath="/admin/categories"
                />
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertTriangle className="size-6 text-destructive" />
                        <AlertDialogTitle>Hapus Kategori?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus kategori <strong>{categoryToDelete?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                            {isDeleting ? 'Menghapus...' : 'Hapus'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}
