import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Category } from '@/types';
import { Bookmark, History, Loader2, Search, Star } from 'lucide-react';
import { useState } from 'react';

interface MobileSearchBarProps {
    value: string;
    onSearch: (query: string) => void;
    isSearching?: boolean;
}

export function MobileSearchBar({ value, onSearch, isSearching = false }: MobileSearchBarProps) {
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
                placeholder="Cari buku..."
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

interface MobileCategoryFilterProps {
    categories: Category[];
    activeCategory: string | null;
    onSelectCategory: (categoryId: string | null) => void;
}

export function MobileCategoryFilter({ categories, activeCategory, onSelectCategory }: MobileCategoryFilterProps) {
    return (
        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
            <Button
                variant={activeCategory === null ? 'default' : 'outline'}
                size="sm"
                className="shrink-0 rounded-full"
                onClick={() => onSelectCategory(null)}
            >
                Semua
            </Button>
            {categories.map((cat) => (
                <Button
                    key={cat.id}
                    variant={activeCategory === cat.id.toString() ? 'default' : 'outline'}
                    size="sm"
                    className="shrink-0 rounded-full"
                    onClick={() => onSelectCategory(cat.id.toString())}
                >
                    {cat.name}
                </Button>
            ))}
        </div>
    );
}

interface MobileQuickFilterProps {
    activeFilter: string | null;
    onSelectFilter: (filter: string | null) => void;
    counters: {
        favorites: number;
        saved: number;
        history: number;
    };
    isAuthenticated: boolean;
}

export function MobileQuickFilter({ activeFilter, onSelectFilter, counters, isAuthenticated }: MobileQuickFilterProps) {
    const filters = [
        { key: 'favorites', label: 'Favorit', icon: Star, count: counters.favorites },
        { key: 'saved', label: 'Disimpan', icon: Bookmark, count: counters.saved },
        { key: 'history', label: 'Riwayat', icon: History, count: counters.history },
    ];

    const FilterButton = ({ filter }: { filter: (typeof filters)[0] }) => {
        const Icon = filter.icon;
        const isActive = activeFilter === filter.key;
        const isDisabled = !isAuthenticated;

        const button = (
            <Button
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                className="shrink-0 rounded-full"
                onClick={() => !isDisabled && onSelectFilter(isActive ? null : filter.key)}
                disabled={isDisabled}
            >
                <Icon size={14} className="mr-1.5" />
                {filter.label}
                <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-xs font-semibold">{filter.count}</span>
            </Button>
        );

        if (isDisabled) {
            return (
                <TooltipProvider delayDuration={100}>
                    <Tooltip>
                        <TooltipTrigger asChild>{button}</TooltipTrigger>
                        <TooltipContent>
                            <p className="text-sm">Login untuk menggunakan fitur ini</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }

        return button;
    };

    return (
        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
            {filters.map((filter) => (
                <FilterButton key={filter.key} filter={filter} />
            ))}
        </div>
    );
}
