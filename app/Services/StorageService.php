<?php

namespace App\Services;

use App\Enums\FileType;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class StorageService
{
    /**
     * Upload file berdasarkan tipe dan return path-nya.
     */
    public static function upload(UploadedFile $file, FileType $type): string
    {
        try {
            $disk = $type->disk();
            $folder = $type->folder();

            Log::info('Attempting file upload', [
                'disk' => $disk,
                'folder' => $folder,
                'original_name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime' => $file->getMimeType(),
            ]);

            $path = $file->store($folder, $disk);

            if (! $path) {
                throw new \Exception("Failed to store file to {$disk} disk in folder {$folder}");
            }

            Log::info('File uploaded successfully', [
                'disk' => $disk,
                'folder' => $folder,
                'path' => $path,
                'size' => $file->getSize(),
            ]);

            return $path;
        } catch (\Exception $e) {
            Log::error('File upload failed', [
                'disk' => $type->disk(),
                'folder' => $type->folder(),
                'original_name' => $file->getClientOriginalName(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw new \Exception("Gagal upload file: {$e->getMessage()}", 0, $e);
        }
    }

    /**
     * Dapatkan public URL dari file path.
     */
    public static function url(?string $path, FileType $type): ?string
    {
        if (! $path) {
            return null;
        }

        $disk = $type->disk();

        try {
            return Storage::disk($disk)->url($path);
        } catch (\Exception $e) {
            Log::error('Failed to generate URL', [
                'disk' => $disk,
                'path' => $path,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Hapus file dari storage.
     */
    public static function delete(?string $path, FileType $type): bool
    {
        if (! $path) {
            return false;
        }

        $disk = $type->disk();

        try {
            if (Storage::disk($disk)->exists($path)) {
                $result = Storage::disk($disk)->delete($path);

                Log::info('File deleted', [
                    'disk' => $disk,
                    'path' => $path,
                    'success' => $result,
                ]);

                return $result;
            }

            Log::warning('File not found for deletion', [
                'disk' => $disk,
                'path' => $path,
            ]);

            return false;
        } catch (\Exception $e) {
            Log::error('File deletion failed', [
                'disk' => $disk,
                'path' => $path,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Check apakah file exists.
     */
    public static function exists(?string $path, FileType $type): bool
    {
        if (! $path) {
            return false;
        }

        $disk = $type->disk();

        try {
            return Storage::disk($disk)->exists($path);
        } catch (\Exception $e) {
            Log::error('File existence check failed', [
                'disk' => $disk,
                'path' => $path,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }
}
