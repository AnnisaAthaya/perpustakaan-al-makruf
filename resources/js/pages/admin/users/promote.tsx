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
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin/admin-layout';
import type { PaginatedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CheckSquare, ChevronLeft, ChevronRight, Filter, GraduationCap, Search, Users, X, XSquare } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Student {
    id: number;
    name: string;
    nis: string;
    grade: number | null;
    class_name: string | null;
    full_class: string;
}

interface PromotePageProps {
    students: PaginatedData<Student>;
    filters: {
        search?: string;
        filter_grade?: string;
        filter_class_name?: string;
    };
}

export default function PromotePage({ students, filters }: PromotePageProps) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [targetGrade, setTargetGrade] = useState<string>('10');
    const [targetClassName, setTargetClassName] = useState<string>('');
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter states
    const [search, setSearch] = useState(filters.search || '');
    const [filterGrade, setFilterGrade] = useState(filters.filter_grade || 'all');
    const [filterClassName, setFilterClassName] = useState(filters.filter_class_name || '');
    const [showFilters, setShowFilters] = useState(!!filters.filter_grade || !!filters.filter_class_name);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            applyFilters();
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    const applyFilters = () => {
        router.get(
            '/admin/users/promote',
            {
                search: search || undefined,
                filter_grade: filterGrade && filterGrade !== 'all' ? filterGrade : undefined,
                filter_class_name: filterClassName || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleFilterChange = () => {
        applyFilters();
    };

    const clearFilters = () => {
        setSearch('');
        setFilterGrade('all');
        setFilterClassName('');
        router.get('/admin/users/promote', {}, { preserveState: true });
    };

    const hasActiveFilters = search || (filterGrade && filterGrade !== 'all') || filterClassName;

    const handleSelectAll = () => {
        if (selectedIds.length === students.data.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(students.data.map((s) => s.id));
        }
    };

    const handleCheckboxChange = (studentId: number) => {
        setSelectedIds((prev) => (prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]));
    };

    const handleSubmitClick = () => {
        if (selectedIds.length === 0 || !targetClassName.trim()) return;
        setConfirmDialogOpen(true);
    };

    const handleConfirmSubmit = () => {
        setIsSubmitting(true);
        router.post(
            '/admin/users/promote',
            {
                target_grade: parseInt(targetGrade),
                target_class_name: targetClassName.trim(),
                user_ids: selectedIds,
            },
            {
                onFinish: () => {
                    setIsSubmitting(false);
                    setConfirmDialogOpen(false);
                },
            },
        );
    };

    return (
        <AdminLayout>
            <Head title="Ganti Kelas Massal" />

            <div className="space-y-6">
                {/* Header with Back Button */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.visit('/admin/users')} className="hover:bg-secondary">
                            <ArrowLeft size={20} />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Ganti Kelas Massal</h1>
                            <p className="mt-1 text-sm text-muted-foreground">Pindahkan siswa ke kelas tertentu secara bersamaan</p>
                        </div>
                    </div>
                </div>

                {/* Info Card & Target Grade Selector */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Info Card */}
                    <Card className="shadow-sm border border-border">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <GraduationCap size={28} className="text-primary" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Siswa</p>
                                    <p className="text-xl font-bold text-foreground">{students.total} siswa</p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Menampilkan {students.from || 0} - {students.to || 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Grade & Class Name Selector */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Tingkat Kelas Tujuan</label>
                                    <Select value={targetGrade} onValueChange={setTargetGrade}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Pilih tingkat kelas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">Kelas 10</SelectItem>
                                            <SelectItem value="11">Kelas 11</SelectItem>
                                            <SelectItem value="12">Kelas 12</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Nama Kelas</label>
                                    <Input
                                        type="text"
                                        placeholder="Contoh: A, B, IPA 1, IPS 2"
                                        value={targetClassName}
                                        onChange={(e) => setTargetClassName(e.target.value)}
                                        maxLength={50}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Hasil: Kelas {targetGrade} {targetClassName || '...'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Student Selection Section */}
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-6">
                            {/* Search & Filter */}
                            <div className="space-y-4">
                                {/* Search Bar */}
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <div className="relative flex-1">
                                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            type="text"
                                            placeholder="Cari siswa (nama atau NIS)..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
                                        <Filter size={16} />
                                        Filter{' '}
                                        {hasActiveFilters &&
                                            `(${[filterGrade && filterGrade !== 'all' && '1', filterClassName && '1'].filter(Boolean).length})`}
                                    </Button>
                                    {hasActiveFilters && (
                                        <Button variant="ghost" onClick={clearFilters} className="gap-2">
                                            <X size={16} />
                                            Clear
                                        </Button>
                                    )}
                                </div>

                                {/* Filter Options */}
                                {showFilters && (
                                    <div className="grid gap-4 rounded-lg border border-border bg-muted/30 p-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">Filter Tingkat Kelas</label>
                                            <Select value={filterGrade} onValueChange={(value) => setFilterGrade(value)}>
                                                <SelectTrigger className="w-full bg-background">
                                                    <SelectValue placeholder="Semua tingkat" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Semua Tingkat</SelectItem>
                                                    <SelectItem value="null">Belum Ada Kelas</SelectItem>
                                                    <SelectItem value="10">Kelas 10</SelectItem>
                                                    <SelectItem value="11">Kelas 11</SelectItem>
                                                    <SelectItem value="12">Kelas 12</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">Filter Nama Kelas</label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="text"
                                                    placeholder="Contoh: A, IPA 1"
                                                    value={filterClassName}
                                                    onChange={(e) => setFilterClassName(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleFilterChange()}
                                                    className="bg-background"
                                                />
                                                <Button onClick={handleFilterChange} size="sm">
                                                    Apply
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="border-t border-border" />

                            {/* Header with Select All */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">Pilih Siswa yang Akan Dipindahkan</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        <span className="font-semibold text-primary">{selectedIds.length}</span> dari{' '}
                                        <span className="font-semibold">{students.data.length}</span> siswa di halaman ini terpilih
                                    </p>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleSelectAll} disabled={students.data.length === 0} className="gap-2">
                                    {selectedIds.length === students.data.length ? (
                                        <>
                                            <XSquare size={16} />
                                            Batal Pilih Semua
                                        </>
                                    ) : (
                                        <>
                                            <CheckSquare size={16} />
                                            Pilih Semua
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Empty State */}
                            {students.data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Users size={32} className="text-muted-foreground" />
                                    <h3 className="text-lg font-semibold text-foreground">Tidak Ada Siswa</h3>
                                    <p className="mt-2 max-w-md text-sm text-muted-foreground">
                                        {hasActiveFilters
                                            ? 'Tidak ada siswa yang sesuai dengan filter yang dipilih.'
                                            : 'Tidak ada siswa yang tersedia untuk dipindahkan kelas.'}
                                    </p>
                                    {hasActiveFilters && (
                                        <Button variant="outline" onClick={clearFilters} className="mt-4 gap-2">
                                            <X size={16} />
                                            Clear Filter
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {/* Desktop Table */}
                                    <div className="hidden overflow-hidden rounded-xl border border-border md:block">
                                        <table className="w-full">
                                            <thead className="bg-muted/50">
                                                <tr>
                                                    <th className="w-12 px-4 py-3 text-left">
                                                        <Checkbox
                                                            checked={selectedIds.length === students.data.length && students.data.length > 0}
                                                            onCheckedChange={handleSelectAll}
                                                        />
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">NO</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">NAMA SISWA</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">NIS</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">KELAS SAAT INI</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {students.data.map((student, index) => (
                                                    <tr
                                                        key={student.id}
                                                        className={`transition-colors ${selectedIds.includes(student.id) ? 'bg-primary/5' : 'hover:bg-muted/50'}`}
                                                    >
                                                        <td className="px-4 py-3">
                                                            <Checkbox
                                                                checked={selectedIds.includes(student.id)}
                                                                onCheckedChange={() => handleCheckboxChange(student.id)}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-muted-foreground">
                                                            {(students.current_page - 1) * students.per_page + index + 1}.
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <p className="font-medium text-foreground">{student.name}</p>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-muted-foreground">{student.nis}</td>
                                                        <td className="px-4 py-3">
                                                            {student.full_class ? (
                                                                <Badge variant="secondary" className="font-medium">
                                                                    {student.full_class}
                                                                </Badge>
                                                            ) : (
                                                                <span className="text-sm text-muted-foreground italic">Belum ada kelas</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile Cards */}
                                    <div className="space-y-3 md:hidden">
                                        {students.data.map((student, index) => (
                                            <Card
                                                key={student.id}
                                                className={`cursor-pointer transition-all ${selectedIds.includes(student.id) ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground/30'}`}
                                                onClick={() => handleCheckboxChange(student.id)}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-start gap-3">
                                                        <Checkbox
                                                            checked={selectedIds.includes(student.id)}
                                                            onCheckedChange={() => handleCheckboxChange(student.id)}
                                                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                                        />
                                                        <div className="flex-1">
                                                            <div className="mb-2 flex items-start justify-between">
                                                                <div>
                                                                    <p className="font-medium text-foreground">{student.name}</p>
                                                                    <p className="text-sm text-muted-foreground">NIS: {student.nis}</p>
                                                                </div>
                                                                <span className="text-xs text-muted-foreground">
                                                                    #{(students.current_page - 1) * students.per_page + index + 1}
                                                                </span>
                                                            </div>
                                                            {student.full_class ? (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {student.full_class}
                                                                </Badge>
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground italic">Belum ada kelas</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {students.last_page > 1 && (
                                        <div className="mt-6 flex justify-center">
                                            <div className="flex items-center gap-2">
                                                {/* Previous Button */}
                                                {students.prev_page_url ? (
                                                    <Link href={students.prev_page_url} preserveState preserveScroll>
                                                        <Button variant="outline" size="sm">
                                                            <ChevronLeft size={16} className="sm:mr-1" />
                                                            <span className="hidden sm:inline">Sebelumnya</span>
                                                        </Button>
                                                    </Link>
                                                ) : (
                                                    <Button variant="outline" size="sm" disabled>
                                                        <ChevronLeft size={16} className="sm:mr-1" />
                                                        <span className="hidden sm:inline">Sebelumnya</span>
                                                    </Button>
                                                )}

                                                {/* Page Numbers - Hidden on mobile, shown on desktop */}
                                                <div className="hidden items-center gap-1 md:flex">
                                                    {students.links.slice(1, -1).map((link) => (
                                                        <Link
                                                            key={link.label}
                                                            href={link.url || '#'}
                                                            preserveState
                                                            preserveScroll
                                                            className={!link.url ? 'pointer-events-none' : ''}
                                                        >
                                                            <Button variant={link.active ? 'default' : 'outline'} size="sm" disabled={!link.url}>
                                                                {link.label}
                                                            </Button>
                                                        </Link>
                                                    ))}
                                                </div>

                                                {/* Page Info - Shown on mobile only */}
                                                <div className="flex items-center px-3 md:hidden">
                                                    <span className="text-sm font-medium text-foreground">
                                                        {students.current_page} / {students.last_page}
                                                    </span>
                                                </div>

                                                {/* Next Button */}
                                                {students.next_page_url ? (
                                                    <Link href={students.next_page_url} preserveState preserveScroll>
                                                        <Button variant="outline" size="sm">
                                                            <span className="hidden sm:inline">Selanjutnya</span>
                                                            <ChevronRight size={16} className="sm:ml-1" />
                                                        </Button>
                                                    </Link>
                                                ) : (
                                                    <Button variant="outline" size="sm" disabled>
                                                        <span className="hidden sm:inline">Selanjutnya</span>
                                                        <ChevronRight size={16} className="sm:ml-1" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3">
                    <Button variant="outline" onClick={() => router.visit('/admin/users')} disabled={isSubmitting}>
                        Batal
                    </Button>
                    <Button
                        onClick={handleSubmitClick}
                        disabled={selectedIds.length === 0 || !targetClassName.trim() || isSubmitting}
                        size="lg"
                        className="gap-2"
                    >
                        <GraduationCap size={18} />
                        Pindahkan {selectedIds.length} Siswa ke Kelas {targetGrade} {targetClassName || '...'}
                    </Button>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <GraduationCap className="size-7 text-primary" />
                        <AlertDialogTitle>Konfirmasi Ganti Kelas</AlertDialogTitle>
                        <AlertDialogDescription>
                            Anda akan memindahkan <span className="font-semibold text-foreground">{selectedIds.length} siswa</span> ke kelas{' '}
                            <span className="font-semibold text-foreground">
                                {targetGrade} {targetClassName}
                            </span>
                            .
                            <br />
                            <br />
                            Tindakan ini akan mengubah tingkat dan nama kelas siswa yang dipilih. Pastikan data sudah benar sebelum melanjutkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmitting}>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmSubmit} disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                            {isSubmitting ? 'Memproses...' : 'Ya, Pindahkan Kelas'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}
