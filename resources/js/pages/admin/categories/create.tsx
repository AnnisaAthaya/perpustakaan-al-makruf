import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/admin/admin-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, FolderPlus, Loader2, Save } from 'lucide-react';
import { FormEvent } from 'react';

interface CategoryFormData {
    name: string;
}

export default function CreateCategory() {
    const { data, setData, post, processing, errors } = useForm<CategoryFormData>({
        name: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/categories');
    };

    return (
        <AdminLayout>
            <Head title="Tambah Kategori" />

            <div className="mx-auto max-w-2xl space-y-6">
                {/* Page Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/categories"
                        className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Tambah Kategori</h1>
                        <p className="mt-0.5 text-muted-foreground">Buat kategori buku baru</p>
                    </div>
                </div>

                {/* Form Card */}
                <Card>
                    <CardHeader className="border-b border-border pb-6">
                        <div className="flex items-center gap-3">
                            <FolderPlus className="size-7 shrink-0 text-primary" />
                            <div>
                                <CardTitle>Informasi Kategori</CardTitle>
                                <CardDescription>Masukkan nama kategori buku yang ingin ditambahkan</CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Category Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Nama Kategori <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="Contoh: Fiksi, Non-Fiksi, Sejarah, dll."
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    aria-invalid={!!errors.name}
                                    autoFocus
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                <p className="text-xs text-muted-foreground">
                                    Gunakan nama yang jelas dan mudah dipahami untuk mengkategorikan buku.
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/admin/categories">Batal</Link>
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
                                            Simpan Kategori
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
