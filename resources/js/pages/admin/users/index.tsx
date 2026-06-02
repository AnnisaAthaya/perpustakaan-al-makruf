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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ServerTable } from '@/components/ui/server-table';
import AdminLayout from '@/layouts/admin/admin-layout';
import type { PaginatedData } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { AlertTriangle, BookOpen, GraduationCap, Mail, Pencil, Trash2, Upload, UserPlus, Users } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    nis: string;
    email: string;
    full_class: string | null;
    active_loans: number;
    total_loans: number;
    created_at: string;
}

interface UsersIndexProps {
    users: PaginatedData<User>;
    stats: {
        total_users: number;
        active_borrowers: number;
        new_this_month: number;
    };
    filters: {
        search?: string;
    };
}

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

export default function UsersIndex({ users, stats, filters }: UsersIndexProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [importDialogOpen, setImportDialogOpen] = useState(false);

    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (!userToDelete) return;

        setIsDeleting(true);
        router.delete(`/admin/users/${userToDelete.id}`, {
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setUserToDelete(null);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    const columns: ColumnDef<User>[] = [
        {
            id: 'no',
            header: 'No',
            cell: ({ row }) => <span className="font-medium text-muted-foreground">{row.index + 1}.</span>,
        },
        {
            id: 'student',
            header: 'Siswa',
            cell: ({ row }) => {
                const { name, nis } = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-sm font-semibold text-primary">{name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                            <p className="font-medium text-foreground">{name}</p>
                            <p className="text-xs text-muted-foreground">NIS: {nis}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'email',
            header: 'Email',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Mail size={14} className="text-muted-foreground" />
                    <span className="text-sm">{row.original.email}</span>
                </div>
            ),
        },
        {
            accessorKey: 'full_class',
            header: 'Kelas',
            cell: ({ row }) => {
                const fullClass = row.original.full_class;
                if (!fullClass) {
                    return <span className="text-sm text-muted-foreground">-</span>;
                }
                return (
                    <div className="flex items-center gap-2">
                        <GraduationCap size={14} className="text-muted-foreground" />
                        <span className="text-sm font-medium">{fullClass}</span>
                    </div>
                );
            },
        },
        {
            id: 'loans',
            header: 'Peminjaman',
            cell: ({ row }) => {
                const { active_loans, total_loans } = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-muted-foreground" />
                        <span className="text-sm">
                            <span className={active_loans > 0 ? 'font-semibold text-primary' : ''}>{active_loans} aktif</span>
                            <span className="text-muted-foreground"> / {total_loans} total</span>
                        </span>
                    </div>
                );
            },
        },
        {
            id: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const hasActiveLoans = row.original.active_loans > 0;
                return hasActiveLoans ? (
                    <Badge variant="success" className="gap-1">
                        <BookOpen size={12} />
                        Sedang Meminjam
                    </Badge>
                ) : (
                    <Badge variant="secondary">Tidak Ada Pinjaman</Badge>
                );
            },
        },
        {
            accessorKey: 'created_at',
            header: 'Terdaftar',
            cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.created_at)}</span>,
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => {
                const user = row.original;
                const hasActiveLoans = user.active_loans > 0;

                return (
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="xs"
                            className="text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                            onClick={() => router.visit(`/admin/users/${user.id}/edit`)}
                        >
                            <Pencil size={12} />
                            Edit
                        </Button>
                        <Button
                            variant="ghost"
                            size="xs"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteClick(user)}
                            disabled={hasActiveLoans}
                            title={hasActiveLoans ? 'Tidak dapat menghapus siswa dengan pinjaman aktif' : undefined}
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
            <Head title="Kelola Siswa" />

            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Data Siswa</h1>
                    <p className="mt-1 text-muted-foreground">Kelola semua data siswa perpustakaan</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Card className="shadow-sm border border-border">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <Users size={20} className="text-primary" />
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{stats.total_users}</p>
                                    <p className="text-xs text-muted-foreground">Total Siswa</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border border-border">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <BookOpen size={20} className="text-blue-600" />
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{stats.active_borrowers}</p>
                                    <p className="text-xs text-muted-foreground">Sedang Meminjam</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border border-border">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <UserPlus size={20} className="text-emerald-600" />
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{stats.new_this_month}</p>
                                    <p className="text-xs text-muted-foreground">Baru Bulan Ini</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 sm:flex-row">
                    <Button variant="outline" onClick={() => setImportDialogOpen(true)} className="w-full gap-2 sm:w-auto">
                        <Upload size={18} />
                        Import CSV
                    </Button>
                    <Button variant="outline" onClick={() => router.visit('/admin/users/promote')} className="w-full gap-2 sm:w-auto">
                        <GraduationCap size={18} />
                        Ganti Kelas
                    </Button>
                    <Button onClick={() => router.visit('/admin/users/create')} className="w-full gap-2 sm:w-auto">
                        <UserPlus size={18} />
                        Tambah Siswa
                    </Button>
                </div>

                {/* Data Table */}
                <ServerTable
                    columns={columns}
                    data={users}
                    searchPlaceholder="Cari siswa (nama, NIS, email)..."
                    searchValue={filters.search}
                    routePath="/admin/users"
                />
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertTriangle className="size-7 text-destructive" />
                        <AlertDialogTitle>Hapus Siswa?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Anda akan menghapus data siswa <span className="font-semibold text-foreground">"{userToDelete?.name}"</span> dengan NIS{' '}
                            <span className="font-semibold text-foreground">{userToDelete?.nis}</span>. Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Menghapus...' : 'Ya, Hapus Siswa'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Import Dialog */}
            <ImportDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                title="Import Data Siswa"
                description="Upload file CSV untuk mengimport data siswa secara massal"
                actionUrl="/admin/import/users"
            />
        </AdminLayout>
    );
}
