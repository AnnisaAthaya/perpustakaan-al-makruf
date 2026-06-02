<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Category;
use App\Models\Loan;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $stats = [
            'admin_count' => User::where('role', UserRole::Admin)->count(),
            'book_count' => Book::count(),
            'member_count' => User::where('role', UserRole::Siswa)->count(),
            'category_count' => Category::count(),
            'borrowed_count' => Loan::active()->count(),
            'overdue_count' => Loan::overdue()->count(),
            'loan_count' => Loan::count(),
            'return_count' => Loan::returned()->count(),
        ];

        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
        ]);
    }
}
