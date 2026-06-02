<?php

use App\Http\Controllers\Admin\AdminManagementController;
use App\Http\Controllers\Admin\BookController as AdminBookController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FineController as AdminFineController;
use App\Http\Controllers\Admin\ImportController;
use App\Http\Controllers\Admin\LibraryVisitController as AdminLibraryVisitController;
use App\Http\Controllers\Admin\LoanController as AdminLoanController;
use App\Http\Controllers\Admin\NotificationController as AdminNotificationController;
use App\Http\Controllers\Admin\ProfileController as AdminProfileController;
use App\Http\Controllers\Admin\ReturnController as AdminReturnController;
use App\Http\Controllers\Admin\SettingController as AdminSettingController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\UserPromotionController;
use App\Http\Controllers\Auth\ChangePasswordController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Siswa\BookController;
use App\Http\Controllers\Siswa\ClearanceController;
use App\Http\Controllers\Siswa\FineController;
use App\Http\Controllers\Siswa\LibraryVisitController;
use App\Http\Controllers\Siswa\LoanController;
use App\Http\Controllers\Siswa\NotificationController;
use App\Http\Controllers\Siswa\ReturnController;
use App\Http\Controllers\Siswa\SettingsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Guest Routes (Unauthenticated)
|--------------------------------------------------------------------------
*/

Route::middleware('guest')->group(function () {
    Route::get('/auth/login', [AuthController::class, 'showLogin'])->name('auth.login');
    Route::post('/auth/login', [AuthController::class, 'login'])->name('auth.authenticate');
});

/*
|--------------------------------------------------------------------------
| Public Routes (No Authentication Required)
|--------------------------------------------------------------------------
| These routes are accessible to guests and siswa users only.
| Admin users will be redirected to admin dashboard.
*/

// Beranda - accessible to guests and siswa only
Route::middleware('redirect.admin')->group(function () {
    Route::get('/', function () {
        return Inertia::render('welcome');
    })->name('home');

    // Katalog Buku - accessible to guests and siswa (read-only)
    Route::get('/books', [BookController::class, 'index'])->name('books.index');
    Route::get('/books/{book}', [BookController::class, 'show'])->name('books.show');
});

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth')->group(function () {
    // Logout
    Route::post('/auth/logout', [AuthController::class, 'logout'])->name('auth.logout');

    // Change Password (for first-time login with default password)
    Route::get('/auth/change-password', [ChangePasswordController::class, 'show'])->name('auth.change-password');
    Route::put('/auth/change-password', [ChangePasswordController::class, 'update'])->name('auth.change-password.update');
});

/*
|--------------------------------------------------------------------------
| Siswa Routes (Authenticated Siswa Only)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'siswa', 'password.changed'])->group(function () {
    // Borrow Book - requires authentication
    Route::post('/books/{book}/borrow', [BookController::class, 'borrow'])->name('books.borrow');

    // Favorite & Save Books
    Route::post('/books/{book}/favorite', [BookController::class, 'toggleFavorite'])->name('books.favorite');
    Route::post('/books/{book}/save', [BookController::class, 'toggleSave'])->name('books.save');

    // Loans / Riwayat Peminjaman
    Route::get('/loans', [LoanController::class, 'index'])->name('loans.index');
    Route::post('/loans/{loan}/cancel', [LoanController::class, 'cancel'])->name('loans.cancel');

    // Returns / Pengembalian Buku
    Route::get('/returns', [ReturnController::class, 'index'])->name('returns.index');

    // Fines / Denda Keterlambatan
    Route::get('/fines', [FineController::class, 'index'])->name('fines.index');
    Route::post('/fines/{fine}/upload-proof', [FineController::class, 'uploadProof'])->name('fines.upload-proof');

    // Clearance / Bebas Pustaka
    Route::get('/clearance', [ClearanceController::class, 'index'])->name('clearance.index');

    // Library Visits / Isi Kunjungan
    Route::get('/visits', [LibraryVisitController::class, 'index'])->name('visits.index');
    Route::post('/visits', [LibraryVisitController::class, 'store'])->name('visits.store');

    // Settings / Pengaturan
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::put('/settings/profile', [SettingsController::class, 'update'])->name('settings.update');
    Route::put('/settings/password', [SettingsController::class, 'updatePassword'])->name('settings.password');

    // Notifications / Notifikasi (Siswa)
    Route::prefix('notifications')->as('notifications.')->group(function () {
        Route::post('/{notification}/read', [NotificationController::class, 'markAsRead'])->name('read');
        Route::post('/read-all', [NotificationController::class, 'markAllAsRead'])->name('read-all');
        Route::delete('/{notification}', [NotificationController::class, 'destroy'])->name('destroy');
    });
});

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'admin'])->prefix('admin')->as('admin.')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Books - Full CRUD
    Route::get('/books', [AdminBookController::class, 'index'])->name('books.index');
    Route::get('/books/create', [AdminBookController::class, 'create'])->name('books.create');
    Route::post('/books', [AdminBookController::class, 'store'])->name('books.store');
    Route::get('/books/{book}/edit', [AdminBookController::class, 'edit'])->name('books.edit');
    Route::put('/books/{book}', [AdminBookController::class, 'update'])->name('books.update');
    Route::delete('/books/{book}', [AdminBookController::class, 'destroy'])->name('books.destroy');

    // Categories - Full CRUD
    Route::get('/categories', [AdminCategoryController::class, 'index'])->name('categories.index');
    Route::get('/categories/create', [AdminCategoryController::class, 'create'])->name('categories.create');
    Route::post('/categories', [AdminCategoryController::class, 'store'])->name('categories.store');
    Route::get('/categories/{category}/edit', [AdminCategoryController::class, 'edit'])->name('categories.edit');
    Route::put('/categories/{category}', [AdminCategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{category}', [AdminCategoryController::class, 'destroy'])->name('categories.destroy');

    // Loans - Data Peminjaman
    Route::get('/loans', [AdminLoanController::class, 'index'])->name('loans.index');
    Route::get('/loans/{loan}', [AdminLoanController::class, 'show'])->name('loans.show');
    Route::post('/loans/{loan}/approve', [AdminLoanController::class, 'approve'])->name('loans.approve');
    Route::post('/loans/{loan}/reject', [AdminLoanController::class, 'reject'])->name('loans.reject');
    Route::post('/loans/{loan}/return', [AdminLoanController::class, 'processReturn'])->name('loans.return');

    // Returns - Data Pengembalian
    Route::get('/returns', [AdminReturnController::class, 'index'])->name('returns.index');
    Route::get('/returns/{loan}', [AdminReturnController::class, 'show'])->name('returns.show');

    // Users - Kelola Siswa
    Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
    Route::get('/users/create', [AdminUserController::class, 'create'])->name('users.create');
    Route::post('/users', [AdminUserController::class, 'store'])->name('users.store');
    Route::get('/users/{user}/edit', [AdminUserController::class, 'edit'])->name('users.edit');
    Route::put('/users/{user}', [AdminUserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [AdminUserController::class, 'destroy'])->name('users.destroy');

    // User Promotion - Kenaikan Kelas Massal
    Route::get('/users/promote', [UserPromotionController::class, 'index'])->name('users.promote.index');
    Route::post('/users/promote', [UserPromotionController::class, 'store'])->name('users.promote.store');

    // Admins - Kelola Admin/Guru
    Route::get('/admins', [AdminManagementController::class, 'index'])->name('admins.index');
    Route::get('/admins/create', [AdminManagementController::class, 'create'])->name('admins.create');
    Route::post('/admins', [AdminManagementController::class, 'store'])->name('admins.store');
    Route::get('/admins/{admin}/edit', [AdminManagementController::class, 'edit'])->name('admins.edit');
    Route::put('/admins/{admin}', [AdminManagementController::class, 'update'])->name('admins.update');
    Route::delete('/admins/{admin}', [AdminManagementController::class, 'destroy'])->name('admins.destroy');

    // Fines - Verifikasi Denda
    Route::get('/fines', [AdminFineController::class, 'index'])->name('fines.index');
    Route::get('/fines/{fine}', [AdminFineController::class, 'show'])->name('fines.show');
    Route::post('/fines/{fine}/verify', [AdminFineController::class, 'verify'])->name('fines.verify');
    Route::post('/fines/{fine}/reject', [AdminFineController::class, 'reject'])->name('fines.reject');

    // Library Visits - Data Kunjungan Perpustakaan
    Route::get('/visits', [AdminLibraryVisitController::class, 'index'])->name('visits.index');

    // Import Data - Import Siswa & Buku (POST only, no dedicated pages)
    Route::post('/import/users', [ImportController::class, 'importUsers'])->name('import.users.store');
    Route::post('/import/books', [ImportController::class, 'importBooks'])->name('import.books.store');

    // Settings - Pengaturan Sistem
    Route::get('/settings', [AdminSettingController::class, 'index'])->name('settings.index');
    Route::post('/settings', [AdminSettingController::class, 'update'])->name('settings.update');

    // Profile - Profil Admin
    Route::get('/profile', [AdminProfileController::class, 'index'])->name('profile.index');
    Route::put('/profile', [AdminProfileController::class, 'update'])->name('profile.update');
    Route::put('/profile/password', [AdminProfileController::class, 'updatePassword'])->name('profile.password');

    // Notifications / Notifikasi (Admin)
    Route::prefix('notifications')->as('notifications.')->group(function () {
        Route::post('/{notification}/read', [AdminNotificationController::class, 'markAsRead'])->name('read');
        Route::post('/read-all', [AdminNotificationController::class, 'markAllAsRead'])->name('read-all');
        Route::delete('/{notification}', [AdminNotificationController::class, 'destroy'])->name('destroy');
    });
});
