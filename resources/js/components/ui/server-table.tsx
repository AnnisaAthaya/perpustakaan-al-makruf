import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { PaginatedData } from '@/types';
import { router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import { type FormEvent, useState } from 'react';

interface ServerTableProps<TData> {
    data: PaginatedData<TData>;
    columns: ColumnDef<TData, unknown>[];
    searchPlaceholder?: string;
    searchValue?: string;
    addButtonLabel?: string;
    onAdd?: () => void;
    routePath?: string;
    additionalParams?: Record<string, string | undefined>;
}

export function ServerTable<TData>({
    data,
    columns,
    searchPlaceholder = 'Cari...',
    searchValue = '',
    addButtonLabel,
    onAdd,
    routePath,
    additionalParams = {},
}: ServerTableProps<TData>) {
    const [searchQuery, setSearchQuery] = useState(searchValue);
    const [isSearching, setIsSearching] = useState(false);

    // Manual pagination with TanStack Table
    const table = useReactTable({
        data: data.data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: data.last_page,
        state: {
            pagination: {
                pageIndex: data.current_page - 1,
                pageSize: data.per_page,
            },
        },
    });

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        if (!routePath) return;

        setIsSearching(true);
        router.get(
            routePath,
            {
                search: searchQuery || undefined,
                ...additionalParams,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsSearching(false),
            },
        );
    };

    const handlePageChange = (url: string | null) => {
        if (!url) return;

        router.get(url, undefined, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Add Button */}
                {addButtonLabel && onAdd && (
                    <Button onClick={onAdd} variant="outline" className="w-full gap-2 sm:w-auto">
                        <Plus size={18} />
                        {addButtonLabel}
                    </Button>
                )}

                {/* Search */}
                {routePath && (
                    <form onSubmit={handleSearch} className="relative w-full sm:max-w-sm">
                        <div className="flex gap-2">
                            <Input
                                placeholder={searchPlaceholder}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                disabled={isSearching}
                                className="flex-1"
                            />
                            <Button type="submit" variant="default" disabled={isSearching} className="gap-2">
                                <Search size={18} />
                                Cari
                            </Button>
                        </div>
                    </form>
                )}
            </div>

            {/* Table */}
            <div className={`overflow-hidden rounded-lg border border-border bg-card ${isSearching ? 'opacity-60' : ''}`}>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="bg-primary hover:bg-primary">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="text-primary-foreground">
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row, index) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className={index % 2 === 1 ? 'bg-muted/50' : ''}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                    {isSearching ? 'Mencari...' : 'Tidak ada data.'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {data.last_page > 1 && (
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <p className="text-sm text-muted-foreground">
                        Menampilkan {data.from || 0} - {data.to || 0} dari {data.total} data
                    </p>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(data.prev_page_url)}
                            disabled={!data.prev_page_url || isSearching}
                        >
                            <ChevronLeft size={16} className="mr-1" />
                            Sebelumnya
                        </Button>

                        <span className="px-2 text-sm text-muted-foreground">
                            Halaman {data.current_page} dari {data.last_page}
                        </span>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(data.next_page_url)}
                            disabled={!data.next_page_url || isSearching}
                        >
                            Selanjutnya
                            <ChevronRight size={16} className="ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
