import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin/admin-layout';
import { LibraryVisit, PaginatedData } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { BookUser, Calendar, ChevronLeft, ChevronRight, FileText, Search, TrendingUp, Users } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface PageProps {
    visits: PaginatedData<LibraryVisit & { student: { id: number; name: string; nis: string; full_class?: string } }>;
    stats: {
        today: number;
        this_week: number;
        this_month: number;
    };
    filters: {
        date: string;
        search: string;
    };
}

// Stats Card Component
function StatsCard({ icon: Icon, label, value, className }: { icon: React.ElementType; label: string; value: string | number; className?: string }) {
    return (
        <Card className={className}>
            <CardContent className="flex items-center justify-between p-5">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    <p className="mt-1 text-3xl font-bold text-foreground">{value}</p>
                </div>
                <Icon size={28} className="text-primary" />
            </CardContent>
        </Card>
    );
}
// Mobile Card Component
function VisitCard({ visit }: { visit: LibraryVisit & { student: { id: number; name: string; nis: string; full_class?: string } } }) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-foreground">{visit.student.name}</h3>
                        <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                            <p>NIS: {visit.student.nis}</p>
                            {visit.student.full_class && <p>Kelas: {visit.student.full_class}</p>}
                        </div>
                    </div>
                    <Badge variant="outline" className="flex-shrink-0">
                        {visit.time}
                    </Badge>
                </div>

                {visit.notes && (
                    <div className="mt-3 rounded-lg bg-muted p-3">
                        <div className="flex items-start gap-2 text-sm">
                            <FileText size={14} className="mt-0.5 flex-shrink-0 text-muted-foreground" />
                            <p className="text-muted-foreground">{visit.notes}</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// Table Columns
const columns: ColumnDef<LibraryVisit & { student: { id: number; name: string; nis: string; full_class?: string } }>[] = [
    {
        accessorKey: 'student.name',
        header: 'Nama Siswa',
        cell: ({ row }) => (
            <div>
                <p className="font-medium text-foreground">{row.original.student.name}</p>
                <p className="text-xs text-muted-foreground">NIS: {row.original.student.nis}</p>
            </div>
        ),
    },
    {
        accessorKey: 'student.full_class',
        header: 'Kelas',
        cell: ({ row }) => row.original.student.full_class || '-',
    },
    {
        accessorKey: 'time',
        header: 'Waktu',
        cell: ({ row }) => <Badge variant="outline">{row.original.time}</Badge>,
    },
    {
        id: 'notes',
        header: 'Keterangan',
        cell: ({ row }) => {
            const notes = row.original.notes;
            if (!notes) return <span className="text-muted-foreground">-</span>;
            return <p className="max-w-md truncate text-sm text-muted-foreground">{notes}</p>;
        },
    },
];

export default function Index({ visits, stats, filters }: PageProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search);
    const [selectedDate, setSelectedDate] = useState(filters.date);
    const [isSearching, setIsSearching] = useState(false);

    // Manual pagination table setup
    const table = useReactTable({
        data: visits.data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: visits.last_page,
        state: {
            pagination: {
                pageIndex: visits.current_page - 1,
                pageSize: visits.per_page,
            },
        },
    });

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        setIsSearching(true);
        router.get(
            '/admin/visits',
            {
                date: selectedDate,
                search: searchQuery,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsSearching(false),
            },
        );
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedDate(new Date().toISOString().split('T')[0]);
        setIsSearching(true);
        router.get(
            '/admin/visits',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsSearching(false),
            },
        );
    };

    const handlePageChange = (page: number) => {
        setIsSearching(true);
        router.get(
            visits.path,
            {
                page,
                date: selectedDate,
                search: searchQuery,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsSearching(false),
            },
        );
    };

    return (
        <AdminLayout>
            <Head title="Data Kunjungan" />

            <div className="flex flex-col gap-6 pb-8">
                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-1.5 rounded-full bg-primary" />
                        <div>
                            <h1 className="text-xl font-bold text-foreground md:text-2xl">DATA KUNJUNGAN PERPUSTAKAAN</h1>
                            <p className="text-sm text-muted-foreground">Monitor kunjungan siswa ke perpustakaan</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <StatsCard
                        icon={Calendar}
                        label="Hari Ini"
                        value={`${stats.today} Siswa`}
                        
                    />
                    <StatsCard
                        icon={TrendingUp}
                        label="Minggu Ini"
                        value={`${stats.this_week} Siswa`}
                        
                    />
                    <StatsCard
                        icon={Users}
                        label="Bulan Ini"
                        value={`${stats.this_month} Siswa`}
                        
                    />
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-6">
                        <form onSubmit={handleSearch} className="flex flex-col gap-4 md:flex-row md:items-end">
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="date">Tanggal</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full md:w-auto"
                                    disabled={isSearching}
                                />
                            </div>
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="search">Cari Siswa</Label>
                                <Input
                                    id="search"
                                    type="text"
                                    placeholder="Nama atau NIS..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    disabled={isSearching}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" className="flex-1 md:flex-initial" disabled={isSearching}>
                                    <Search size={16} className="mr-2" />
                                    {isSearching ? 'Mencari...' : 'Filter'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClearFilters}
                                    className="flex-1 md:flex-initial"
                                    disabled={isSearching}
                                >
                                    Reset
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Empty State */}
                {visits.data.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <BookUser size={48} className="text-muted-foreground" />
                            <h3 className="text-lg font-semibold text-foreground">Tidak Ada Data</h3>
                            <p className="mt-2 text-sm text-muted-foreground">Tidak ada kunjungan untuk tanggal yang dipilih.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Mobile View - Cards */}
                        <div className="flex flex-col gap-3 lg:hidden">
                            {visits.data.map((visit) => (
                                <VisitCard key={visit.id} visit={visit} />
                            ))}
                        </div>

                        {/* Desktop View - Table with Pagination */}
                        <div className="hidden lg:block">
                            <Card>
                                <CardContent className="p-6">
                                    <div className={`rounded-md border transition-opacity ${isSearching ? 'pointer-events-none opacity-50' : ''}`}>
                                        <Table>
                                            <TableHeader>
                                                {table.getHeaderGroups().map((headerGroup) => (
                                                    <TableRow key={headerGroup.id}>
                                                        {headerGroup.headers.map((header) => (
                                                            <TableHead key={header.id}>
                                                                {header.isPlaceholder
                                                                    ? null
                                                                    : flexRender(header.column.columnDef.header, header.getContext())}
                                                            </TableHead>
                                                        ))}
                                                    </TableRow>
                                                ))}
                                            </TableHeader>
                                            <TableBody>
                                                {table.getRowModel().rows.length ? (
                                                    table.getRowModel().rows.map((row) => (
                                                        <TableRow key={row.id}>
                                                            {row.getVisibleCells().map((cell) => (
                                                                <TableCell key={cell.id}>
                                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                                            Tidak ada data.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Pagination Controls */}
                                    {visits.last_page > 1 && (
                                        <div className="flex items-center justify-between pt-4">
                                            <div className="text-sm text-muted-foreground">
                                                Halaman {visits.current_page} dari {visits.last_page} ({visits.total} data)
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePageChange(visits.current_page - 1)}
                                                    disabled={!visits.prev_page_url || isSearching}
                                                    className="gap-1"
                                                >
                                                    <ChevronLeft size={16} />
                                                    Sebelumnya
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePageChange(visits.current_page + 1)}
                                                    disabled={!visits.next_page_url || isSearching}
                                                    className="gap-1"
                                                >
                                                    Selanjutnya
                                                    <ChevronRight size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
}
