import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search } from 'lucide-react';
import { useState } from 'react';

interface SearchWidgetProps {
    value: string;
    onSearch: (query: string) => void;
    isSearching?: boolean;
}

export function SearchWidget({ value, onSearch, isSearching = false }: SearchWidgetProps) {
    const [searchQuery, setSearchQuery] = useState(value);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(searchQuery);
    };

    return (
        <form onSubmit={handleSubmit} className="relative">
            {isSearching ? (
                <Loader2 className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 animate-spin text-primary" />
            ) : (
                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            )}
            <Input
                type="text"
                placeholder="Cari judul, penulis..."
                className="pr-20 pl-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isSearching}
            />
            <Button type="submit" size="sm" disabled={isSearching} className="absolute top-1/2 right-2 h-8 -translate-y-1/2 gap-1.5">
                <Search size={14} />
                Cari
            </Button>
        </form>
    );
}
