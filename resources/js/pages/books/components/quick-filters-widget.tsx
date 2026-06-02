import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Bookmark, History, Star } from 'lucide-react';

interface QuickFiltersWidgetProps {
    activeFilter: string | null;
    onSelectFilter: (filter: string | null) => void;
    counters: {
        favorites: number;
        saved: number;
        history: number;
    };
    isAuthenticated: boolean;
}

export function QuickFiltersWidget({ activeFilter, onSelectFilter, counters, isAuthenticated }: QuickFiltersWidgetProps) {
    const filters = [
        {
            key: 'favorites',
            label: 'Favorit',
            icon: Star,
            count: counters.favorites,
        },
        {
            key: 'saved',
            label: 'Disimpan',
            icon: Bookmark,
            count: counters.saved,
        },
        {
            key: 'history',
            label: 'Riwayat',
            icon: History,
            count: counters.history,
        },
    ];

    const FilterButton = ({ filter }: { filter: (typeof filters)[0] }) => {
        const Icon = filter.icon;
        const isActive = activeFilter === filter.key;
        const isDisabled = !isAuthenticated;

        const button = (
            <button
                onClick={() => !isDisabled && onSelectFilter(isActive ? null : filter.key)}
                disabled={isDisabled}
                className={`relative flex aspect-square items-center justify-center rounded-lg transition-all ${
                    isActive
                        ? 'bg-primary text-white shadow-md'
                        : isDisabled
                          ? 'cursor-not-allowed bg-secondary/30'
                          : 'bg-secondary/50 hover:bg-secondary'
                }`}
            >
                <Icon size={18} className={isActive ? 'text-white' : isDisabled ? 'text-muted-foreground' : 'text-primary'} />
                {filter.count > 0 && (
                    <span
                        className={`absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                            isActive ? 'bg-white text-primary' : 'bg-primary text-white'
                        }`}
                    >
                        {filter.count}
                    </span>
                )}
            </button>
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

        return (
            <TooltipProvider delayDuration={100}>
                <Tooltip>
                    <TooltipTrigger asChild>{button}</TooltipTrigger>
                    <TooltipContent>
                        <p className="text-sm font-semibold">{filter.label}</p>
                        <p className="text-xs text-muted-foreground">{filter.count} buku</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    };

    return (
        <Card className="gap-2">
            <CardHeader className="">
                <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary" />
                    <h3 className="text-xs font-bold tracking-wide text-foreground uppercase">Filter Cepat</h3>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="grid grid-cols-3 gap-4">
                    {filters.map((filter) => (
                        <FilterButton key={filter.key} filter={filter} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
