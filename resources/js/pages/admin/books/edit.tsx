import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin/admin-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, BookOpen, ImagePlus, Loader2, Save, X } from 'lucide-react';
import { ChangeEvent, FormEvent, useRef, useState } from 'react';

interface Category {
    id: number;
    name: string;
}

interface Book {
    id: number;
    title: string;
    code: string;
    author: string;
    category_id: number;
    publisher: string;
    language: string;
    description: string;
    isbn: string;
    location: string | null;
    year: number | null;
    stock: number;
    available: number;
    cover: string | null;
}

interface EditBookProps {
    book: Book;
    categories: Category[];
}

interface BookFormData {
    title: string;
    code: string;
    author: string;
    category_id: number;
    publisher: string;
    language: string;
    description: string;
    isbn: string;
    location: string;
    year: string;
    stock: number;
    cover: File | null;
    _method: string;
}

export default function EditBook({ book, categories }: EditBookProps) {
    const [coverPreview, setCoverPreview] = useState<string | null>(book.cover);
    const [coverChanged, setCoverChanged] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm<BookFormData>({
        title: book.title,
        code: book.code,
        author: book.author,
        category_id: book.category_id,
        publisher: book.publisher,
        language: book.language,
        description: book.description,
        isbn: book.isbn,
        location: book.location || '',
        year: book.year ? book.year.toString() : '',
        stock: book.stock,
        cover: null,
        _method: 'PUT',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(`/admin/books/${book.id}`, {
            forceFormData: true,
        });
    };

    const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('cover', file);
            setCoverChanged(true);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeCover = () => {
        setData('cover', null);
        setCoverPreview(null);
        setCoverChanged(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <AdminLayout>
            <Head title={`Edit: ${book.title}`} />

            <div className="mx-auto max-w-3xl space-y-6">
                {/* Page Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/books"
                        className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Edit Buku</h1>
                        <p className="mt-0.5 text-muted-foreground">Perbarui informasi buku perpustakaan</p>
                    </div>
                </div>

                {/* Form Card */}
                <Card>
                    <CardHeader className="border-b border-border pb-6">
                        <div className="flex items-center gap-3">
                            <BookOpen className="size-7 shrink-0 text-warning" />
                            <div>
                                <CardTitle>Edit: {book.title}</CardTitle>
                                <CardDescription>Kode Buku: {book.code}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Cover Upload */}
                            <div className="space-y-2">
                                <Label>Cover Buku</Label>
                                <div className="flex items-start gap-4">
                                    {coverPreview ? (
                                        <div className="relative">
                                            <img
                                                src={coverPreview}
                                                alt="Cover preview"
                                                className="shadow-soft-md h-40 w-28 rounded-xl object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeCover}
                                                className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-destructive text-white shadow-md transition-transform hover:scale-110"
                                            >
                                                <X size={14} />
                                            </button>
                                            {coverChanged && (
                                                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                                                    Baru
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex h-40 w-28 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/50 text-muted-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
                                        >
                                            <ImagePlus size={24} />
                                            <span className="text-xs font-medium">Upload</span>
                                        </button>
                                    )}
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                                    <div className="flex-1 space-y-1 pt-2">
                                        <p className="text-sm text-muted-foreground">Upload cover buku dalam format JPG, PNG, atau WebP.</p>
                                        <p className="text-xs text-muted-foreground">Ukuran maksimal 2MB dengan rasio 2:3</p>
                                        {!coverChanged && book.cover && (
                                            <p className="text-xs text-muted-foreground">Cover saat ini akan tetap digunakan jika tidak diubah.</p>
                                        )}
                                    </div>
                                </div>
                                {errors.cover && <p className="text-sm text-destructive">{errors.cover}</p>}
                            </div>

                            {/* Title & Code Row */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="title">
                                        Judul Buku <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="title"
                                        placeholder="Masukkan judul buku"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        aria-invalid={!!errors.title}
                                    />
                                    {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="code">
                                        Kode Buku <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="code"
                                        placeholder="Contoh: B001"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        aria-invalid={!!errors.code}
                                    />
                                    {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
                                </div>
                            </div>

                            {/* Author & Category Row */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="author">
                                        Penulis <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="author"
                                        placeholder="Nama penulis"
                                        value={data.author}
                                        onChange={(e) => setData('author', e.target.value)}
                                        aria-invalid={!!errors.author}
                                    />
                                    {errors.author && <p className="text-sm text-destructive">{errors.author}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category_id">
                                        Kategori <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={data.category_id?.toString() || ''}
                                        onValueChange={(value: string) => setData('category_id', parseInt(value))}
                                    >
                                        <SelectTrigger id="category_id" aria-invalid={!!errors.category_id}>
                                            <SelectValue placeholder="Pilih kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category_id && <p className="text-sm text-destructive">{errors.category_id}</p>}
                                </div>
                            </div>

                            {/* Publisher & Language Row */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="publisher">
                                        Penerbit <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="publisher"
                                        placeholder="Nama penerbit"
                                        value={data.publisher}
                                        onChange={(e) => setData('publisher', e.target.value)}
                                        aria-invalid={!!errors.publisher}
                                    />
                                    {errors.publisher && <p className="text-sm text-destructive">{errors.publisher}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="language">
                                        Bahasa <span className="text-destructive">*</span>
                                    </Label>
                                    <Select value={data.language} onValueChange={(value: string) => setData('language', value)}>
                                        <SelectTrigger id="language" aria-invalid={!!errors.language}>
                                            <SelectValue placeholder="Pilih bahasa" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Indonesia">Indonesia</SelectItem>
                                            <SelectItem value="English">English</SelectItem>
                                            <SelectItem value="Arabic">Arabic</SelectItem>
                                            <SelectItem value="Other">Lainnya</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.language && <p className="text-sm text-destructive">{errors.language}</p>}
                                </div>
                            </div>

                            {/* ISBN & Year Row */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="isbn">ISBN/ISSN</Label>
                                    <Input
                                        id="isbn"
                                        placeholder="Contoh: 978-602-8519-93-9"
                                        value={data.isbn}
                                        onChange={(e) => setData('isbn', e.target.value)}
                                        aria-invalid={!!errors.isbn}
                                    />
                                    {errors.isbn && <p className="text-sm text-destructive">{errors.isbn}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="year">Tahun Terbit</Label>
                                    <Input
                                        id="year"
                                        type="number"
                                        placeholder="Contoh: 2023"
                                        value={data.year}
                                        onChange={(e) => setData('year', e.target.value)}
                                        aria-invalid={!!errors.year}
                                    />
                                    {errors.year && <p className="text-sm text-destructive">{errors.year}</p>}
                                </div>
                            </div>

                            {/* Location & Stock Row */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="location">Lokasi Rak</Label>
                                    <Input
                                        id="location"
                                        placeholder="Contoh: A-12, B-05"
                                        value={data.location}
                                        onChange={(e) => setData('location', e.target.value)}
                                        aria-invalid={!!errors.location}
                                    />
                                    {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="stock">
                                        Jumlah Stok <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="stock"
                                        type="number"
                                        min={1}
                                        placeholder="Jumlah buku"
                                        value={data.stock}
                                        onChange={(e) => setData('stock', parseInt(e.target.value) || 1)}
                                        aria-invalid={!!errors.stock}
                                    />
                                    {errors.stock && <p className="text-sm text-destructive">{errors.stock}</p>}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi Fisik</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Contoh: 120 halaman, hardcover, 15 x 21 cm"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    aria-invalid={!!errors.description}
                                />
                                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                            </div>

                            {/* Book Stats Info */}
                            <div className="rounded-xl bg-muted/50 p-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Total Stok:</span>
                                        <span className="ml-2 font-semibold">{book.stock} buku</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Tersedia:</span>
                                        <span className="ml-2 font-semibold text-primary">{book.available} buku</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/admin/books">Batal</Link>
                                </Button>
                                <Button type="submit" disabled={processing} className="gap-2">
                                    {processing ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Simpan Perubahan
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
