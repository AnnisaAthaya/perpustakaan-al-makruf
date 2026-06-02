import { Button } from '@/components/ui/button';
import type { Book, PaginatedData } from '@/types';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    data: PaginatedData<Book>;
}

export function Pagination({ data }: PaginationProps) {
    if (data.last_page <= 1) return null;

    return (
        <div className="mt-4 flex justify-center">
            <div className="flex items-center gap-2">
                {data.prev_page_url ? (
                    <Link href={data.prev_page_url} preserveState preserveScroll>
                        <Button variant="outline" size="sm">
                            <ChevronLeft size={16} className="mr-1" />
                            Sebelumnya
                        </Button>
                    </Link>
                ) : (
                    <Button variant="outline" size="sm" disabled>
                        <ChevronLeft size={16} className="mr-1" />
                        Sebelumnya
                    </Button>
                )}

                <div className="flex items-center gap-1">
                    {data.links.slice(1, -1).map((link) => (
                        <Link key={link.label} href={link.url || '#'} preserveState preserveScroll className={!link.url ? 'pointer-events-none' : ''}>
                            <Button variant={link.active ? 'default' : 'outline'} size="sm" disabled={!link.url}>
                                {link.label}
                            </Button>
                        </Link>
                    ))}
                </div>

                {data.next_page_url ? (
                    <Link href={data.next_page_url} preserveState preserveScroll>
                        <Button variant="outline" size="sm">
                            Selanjutnya
                            <ChevronRight size={16} className="ml-1" />
                        </Button>
                    </Link>
                ) : (
                    <Button variant="outline" size="sm" disabled>
                        Selanjutnya
                        <ChevronRight size={16} className="ml-1" />
                    </Button>
                )}
            </div>
        </div>
    );
}
