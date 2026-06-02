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
import { AlertTriangle, Mail, Pencil, Phone, ShieldCheck, Trash2, UserPlus, Users } from 'lucide-react';
import { useState } from 'react';

interface Admin {
    id: number;
    name: string;
    nis: string;
    email: string;
    phone: string | null;
    created_at: string;
}

interface AdminsIndexProps {
    admins: PaginatedData<Admin>;
    stats: {
        total_admins: number;
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

export default function AdminsIndex({ admins, stats, filters }: AdminsIndexProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (admin: Admin) => {
        setAdminToDelete(admin);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (!adminToDelete) return;

        setIsDeleting(true);
        router.delete(`/admin/admins/${adminToDelete.id}`, {
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setAdminToDelete(null);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    const columns: ColumnDef<Admin>[] = [
        {
            id: 'no',
            header: 'No',
            cell: ({ row }) => <span className="font-medium text-muted-foreground">{row.index + 1}.</span>,
        },
        {
            id: 'admin',
            header: 'Admin/Guru',
            cell: ({ row }) => {
                const { name, nis } = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <ShieldCheck size={18} className="text-primary" />
                        <div>
                            <p className="font-medium text-foreground">{name}</p>
                            <p className="text-xs text-muted-foreground">NIS/NIP: {nis}</p>
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
            accessorKey: 'phone',
            header: 'No. HP',
            cell: ({ row }) => {
                const phone = row.original.phone;
                if (!phone) {
                    return <span className="text-sm text-muted-foreground">-</span>;
                }
                return (
                    <div className="flex items-center gap-2">
                        <Phone size={14} className="text-muted-foreground" />
                        <span className="text-sm">{phone}</span>
                    </div>
                );
            },
        },
        {
            id: 'status',
            header: 'Role',
            cell: () => (
                <Badge variant="default" className="gap-1">
                    <ShieldCheck size={12} />
                    Administrator
                </Badge>
            ),
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
                const admin = row.original;

                return (
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="xs"
                            className="text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                            onClick={() => router.visit(`/admin/admins/${admin.id}/edit`)}
                        >
                            <Pencil size={12} />
                            Edit
                        </Button>
                        <Button
                            variant="ghost"
                            size="xs"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteClick(admin)}
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
            <Head title="Kelola Admin" />

            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Data Admin & Guru</h1>
                    <p className="mt-1 text-muted-foreground">Kelola semua data admin dan guru perpustakaan</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Card className="shadow-sm border border-border">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <Users size={20} className="text-primary" />
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{stats.total_admins}</p>
                                    <p className="text-xs text-muted-foreground">Total Admin & Guru</p>
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
                    <Button onClick={() => router.visit('/admin/admins/create')} className="w-full gap-2 sm:w-auto">
                        <UserPlus size={18} />
                        Tambah Admin
                    </Button>
                </div>

                {/* Data Table */}
                <ServerTable
                    columns={columns}
                    data={admins}
                    searchPlaceholder="Cari admin/guru (nama, NIS/NIP, email)..."
                    searchValue={filters.search}
                    routePath="/admin/admins"
                />
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertTriangle className="size-7 text-destructive" />
                        <AlertDialogTitle>Hapus Admin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Anda akan menghapus data admin <span className="font-semibold text-foreground">"{adminToDelete?.name}"</span> dengan
                            NIS/NIP <span className="font-semibold text-foreground">{adminToDelete?.nis}</span>. Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Menghapus...' : 'Ya, Hapus Admin'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}
