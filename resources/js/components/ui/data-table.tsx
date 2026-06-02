import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, Search } from 'lucide-react';
import { useState } from 'react';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    searchKey?: string;
    searchPlaceholder?: string;
    addButtonLabel?: string;
    onAdd?: () => void;
    pageSize?: number;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    searchPlaceholder = 'Cari...',
    addButtonLabel,
    onAdd,
    pageSize = 10,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: 'includesString',
        state: {
            sorting,
            columnFilters,
            globalFilter,
        },
        initialState: {
            pagination: {
                pageSize,
            },
        },
    });

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
                <div className="relative w-full sm:max-w-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
                        <Button size="icon" className="rounded-r-none">
                            <Search size={18} />
                        </Button>
                    </div>
                    <Input
                        placeholder={searchPlaceholder}
                        value={searchKey ? (table.getColumn(searchKey)?.getFilterValue() as string) ?? '' : globalFilter}
                        onChange={(e) => {
                            if (searchKey) {
                                table.getColumn(searchKey)?.setFilterValue(e.target.value);
                            } else {
                                setGlobalFilter(e.target.value);
                            }
                        }}
                        className="pl-12"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-border bg-card">
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
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                    className={index % 2 === 1 ? 'bg-muted/50' : ''}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                    Tidak ada data.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-sm text-muted-foreground">
                    Menampilkan {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} -{' '}
                    {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)}{' '}
                    dari {table.getFilteredRowModel().rows.length} data
                </p>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon-sm" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                        <ChevronsLeft size={16} />
                    </Button>
                    <Button variant="outline" size="icon-sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                        <ChevronLeft size={16} />
                    </Button>

                    <span className="px-2 text-sm text-muted-foreground">
                        Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
                    </span>

                    <Button variant="outline" size="icon-sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                        <ChevronRight size={16} />
                    </Button>
                    <Button variant="outline" size="icon-sm" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
                        <ChevronsRight size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
