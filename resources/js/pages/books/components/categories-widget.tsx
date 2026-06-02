import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { Category } from '@/types';
import { Book as BookIcon, Sparkles } from 'lucide-react';

interface CategoriesWidgetProps {
    categories: Category[];
    activeCategory: string | null;
    onSelectCategory: (categoryId: string | null) => void;
}

export function CategoriesWidget({ categories, activeCategory, onSelectCategory }: CategoriesWidgetProps) {
    return (
        <Card className="gap-2">
            <CardHeader className="">
                <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-primary" />
                    <h3 className="text-sm font-bold tracking-wide text-foreground uppercase">Kategori Buku</h3>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                    {/* Semua Buku */}
                    <button
                        onClick={() => onSelectCategory(null)}
                        className={`group flex items-center gap-2 rounded p-2 text-center ${
                            !activeCategory ? 'bg-primary text-white' : 'bg-secondary/50 hover:bg-secondary'
                        }`}
                    >
                        <BookIcon size={20} className={!activeCategory ? 'text-white' : 'text-primary'} />
                        <span className={`text-xs font-semibold ${!activeCategory ? 'text-white' : 'text-foreground'}`}>Semua</span>
                    </button>

                    {/* Category Items */}
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => onSelectCategory(category.id.toString())}
                            className={`group flex items-center gap-2 rounded p-2 text-center ${
                                activeCategory === category.id.toString() ? 'bg-primary text-white' : 'bg-secondary/50 hover:bg-secondary'
                            }`}
                        >
                            <div
                                className={`flex size-4 items-center justify-center rounded-xl ${
                                    activeCategory === category.id.toString() ? 'bg-white/20' : 'bg-primary/10'
                                }`}
                            >
                                <span className={`text-sm font-bold ${activeCategory === category.id.toString() ? 'text-white' : 'text-primary'}`}>
                                    {category.books_count || 0}
                                </span>
                            </div>
                            <span
                                className={`line-clamp-1 text-xs font-semibold ${
                                    activeCategory === category.id.toString() ? 'text-white' : 'text-foreground'
                                }`}
                            >
                                {category.name}
                            </span>
                        </button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
