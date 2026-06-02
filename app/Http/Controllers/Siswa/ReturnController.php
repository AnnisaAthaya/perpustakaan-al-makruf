<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\Loan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ReturnController extends Controller
{
    /**
     * Display active loans for the authenticated user.
     * Note: Actual book return is processed by Admin at the library.
     * This page shows the student their currently borrowed books.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $search = $request->get('search');

        $activeLoansQuery = Loan::query()
            ->with(['book.category'])
            ->where('user_id', $user->id)
            ->active()
            ->when($search, function ($query, $search) {
                $query->whereHas('book', function ($bookQuery) use ($search) {
                    $bookQuery->where('title', 'like', "%{$search}%");
                });
            })
            ->orderBy('due_date')
            ->paginate(20)
            ->withQueryString();

        $activeLoans = $activeLoansQuery->through(function ($loan) {
            return [
                'id' => $loan->id,
                'book' => [
                    'id' => $loan->book->id,
                    'title' => $loan->book->title,
                    'author' => $loan->book->author,
                    'category' => $loan->book->category?->name ?? 'Umum',
                    'cover' => $loan->book->cover,
                    'location' => $loan->book->location,
                ],
                'borrowed_at' => $loan->borrowed_at,
                'due_date' => $loan->due_date,
                'is_overdue' => $loan->isOverdue(),
                'overdue_days' => $loan->overdue_days,
                'days_remaining' => $loan->days_remaining,
                'estimated_fine' => $loan->estimated_fine,
            ];
        });

        // Calculate stats from all active loans (not filtered by search)
        $allActiveLoans = Loan::query()
            ->where('user_id', $user->id)
            ->active()
            ->get();

        $totalBorrowed = $allActiveLoans->count();
        $onTime = $allActiveLoans->filter(fn ($loan) => ! $loan->isOverdue())->count();
        $overdue = $allActiveLoans->filter(fn ($loan) => $loan->isOverdue())->count();
        $totalFines = $allActiveLoans->sum('estimated_fine');

        return Inertia::render('returns/index', [
            'activeLoans' => $activeLoans,
            'stats' => [
                'totalBorrowed' => $totalBorrowed,
                'onTime' => $onTime,
                'overdue' => $overdue,
                'totalFines' => $totalFines,
            ],
            'filters' => [
                'search' => $search,
            ],
        ]);
    }
}
