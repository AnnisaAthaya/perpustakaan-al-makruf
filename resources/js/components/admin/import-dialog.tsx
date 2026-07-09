import { ModalShell } from '@/components/generated-components/modal-shell';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useForm, usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ImportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    actionUrl: string;
    acceptedFormat?: string;
}

interface FlashData {
    success?: string;
    error?: string;
    errors?: string[];
    failedCount?: number;
}

export function ImportDialog({ open, onOpenChange, title, description, actionUrl, acceptedFormat = '.csv' }: ImportDialogProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { flash } = usePage<{ flash: FlashData }>().props;

    // Inertia form helper
    const { data, setData, post, processing, progress, reset } = useForm({
        csv: null as File | null,
    });

    // Reset file when dialog closes
    useEffect(() => {
        if (!open) {
            reset();
        }
    }, [open]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.name.endsWith(acceptedFormat)) {
            setData('csv', droppedFile);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setData('csv', selectedFile);
        }
    };

    const handleRemoveFile = () => {
        setData('csv', null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.csv) return;

        post(actionUrl, {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                reset();
            },
        });
    };

    return (
        <ModalShell
            open={open}
            onOpenChange={onOpenChange}
            title={title}
            description={description}
            size="xl"
            footer={
                <div className="flex w-full gap-2">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1" disabled={processing}>
                        Batal
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={!data.csv || processing} className="flex-1">
                        {processing ? 'Mengimport...' : 'Import Sekarang'}
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                {/* Flash Messages */}
                {flash?.success && (
                    <Alert className="border-green-200 bg-green-50">
                        <CheckCircle2 className="size-4 text-green-600" />
                        <AlertDescription className="text-green-800">{flash.success}</AlertDescription>
                    </Alert>
                )}

                {flash?.error && (
                    <Alert variant="destructive">
                        <AlertCircle className="size-4" />
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}

                {flash?.importErrors && flash.importErrors.length > 0 && (
                    <Alert variant="destructive">
                        <AlertCircle className="size-4" />
                        <AlertDescription>
                            <div className="space-y-1">
                                <p className="font-semibold">
                                    Ditemukan {flash.failedCount} error{flash.failedCount! > 1 ? 's' : ''} (menampilkan 10 pertama):
                                </p>
                                <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                                    {flash.importErrors.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Upload Form */}
                <div className="space-y-4">
                    {/* File Upload Zone */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => !data.csv && fileInputRef.current?.click()}
                        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                            isDragging
                                ? 'border-primary bg-emerald-50'
                                : data.csv
                                  ? 'border-green-300 bg-green-50'
                                  : 'border-muted hover:border-primary hover:bg-muted'
                        }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={acceptedFormat}
                            onChange={handleFileSelect}
                            className="hidden"
                            disabled={processing}
                        />

                        {!data.csv ? (
                            <>
                                <Upload className="mx-auto size-8 text-primary" />
                                <h3 className="mb-2 text-lg font-semibold text-foreground">Pilih file CSV atau drag & drop di sini</h3>
                                <p className="text-sm text-muted-foreground">File CSV dengan ukuran maksimal 10MB</p>
                            </>
                        ) : (
                            <div className="flex items-center justify-center gap-3">
                                <CheckCircle2 className="size-6 text-green-600" />
                                <div className="text-left">
                                    <p className="font-semibold text-foreground">{data.csv.name}</p>
                                    <p className="text-sm text-muted-foreground">{(data.csv.size / 1024).toFixed(2)} KB</p>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveFile();
                                    }}
                                    className="ml-auto"
                                    disabled={processing}
                                >
                                    <X size={16} />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Upload Progress */}
                    {progress && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Uploading...</span>
                                <span className="font-semibold text-primary">{progress.percentage}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress.percentage}%` }} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ModalShell>
    );
}
