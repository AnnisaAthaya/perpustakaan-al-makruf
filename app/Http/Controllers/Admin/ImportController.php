<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ImportCsvRequest;
use App\Imports\BooksImport;
use App\Imports\UsersImport;
use Illuminate\Http\RedirectResponse;
use Maatwebsite\Excel\Facades\Excel;

class ImportController extends Controller
{
    /**
     * Process user import from CSV
     */
    public function importUsers(ImportCsvRequest $request): RedirectResponse
    {
        // Increase execution time for large imports (856 rows)
        set_time_limit(300); // 5 minutes

        try {
            $file = $request->file('csv');

            // Create import instance
            $import = new UsersImport;

            // Execute import with Laravel Excel
            Excel::import($import, $file);

            // Collect errors
            $errors = collect($import->errors())->map(function ($e, $index) {
                return "Baris {$index}: {$e->getMessage()}";
            })->take(10)->toArray(); // Show max 10 errors

            if (empty($errors)) {
                return redirect()
                    ->route('admin.users.index')
                    ->with('success', 'Import berhasil! Semua data siswa telah diimport.');
            }

            return redirect()
                ->route('admin.users.index')
                ->with('success', 'Import selesai dengan beberapa error. Silakan periksa data yang gagal.')
                ->with('importErrors', $errors)
                ->with('failedCount', count($import->errors()));

        } catch (\Throwable $e) {
            return redirect()
                ->route('admin.users.index')
                ->with('error', 'Import gagal: '.$e->getMessage());
        }
    }

    /**
     * Process book import from CSV
     */
    public function importBooks(ImportCsvRequest $request): RedirectResponse
    {
        // Increase execution time for large imports (960 rows)
        set_time_limit(300); // 5 minutes

        try {
            $file = $request->file('csv');

            // Create import instance
            $import = new BooksImport;

            // Execute import with Laravel Excel
            Excel::import($import, $file);

            // Collect errors
            $errors = collect($import->errors())->map(function ($e, $index) {
                return "Baris {$index}: {$e->getMessage()}";
            })->take(10)->toArray(); // Show max 10 errors

            if (empty($errors)) {
                return redirect()
                    ->route('admin.books.index')
                    ->with('success', 'Import berhasil! Semua data buku telah diimport.');
            }

            return redirect()
                ->route('admin.books.index')
                ->with('success', 'Import selesai dengan beberapa error. Silakan periksa data yang gagal.')
                ->with('importErrors', $errors)
                ->with('failedCount', count($import->errors()));

        } catch (\Throwable $e) {
            return redirect()
                ->route('admin.books.index')
                ->with('error', 'Import gagal: '.$e->getMessage());
        }
    }
}
