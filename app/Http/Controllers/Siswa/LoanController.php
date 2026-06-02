<?php

namespace App\Http\Controllers\Siswa;

use App\Enums\LoanStatus;
use App\Http\Controllers\Controller;
use App\Models\Loan;
use App\Services\NotificationBuilder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class LoanController extends Controller
{
    /**
     * Display loan history for the authenticated user.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $search = $request->get('search');

        $loansQuery = Loan::query()
            ->with(['book.category', 'fine'])
            ->where('user_id', $user->id)
            ->when($search, function ($query, $search) {
                $query->whereHas('book', function ($bookQuery) use ($search) {
                    $bookQuery->where('title', 'like', "%{$search}%")
                        ->orWhere('author', 'like', "%{$search}%");
                });
            })
            ->orderByRaw("CASE 
                WHEN status = 'pending' THEN 1 
                WHEN status = 'active' THEN 2 
                WHEN status = 'overdue' THEN 3 
                ELSE 4 
            END")
            ->orderByDesc('requested_at')
            ->paginate(20)
            ->withQueryString();

        $loans = $loansQuery->through(function ($loan) {
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
                'requested_at' => $loan->requested_at,
                'borrowed_at' => $loan->borrowed_at,
                'due_date' => $loan->due_date,
                'returned_at' => $loan->returned_at,
                'status' => $loan->status->value,
                'status_label' => $loan->status->label(),
                'status_color' => $loan->status->color(),
                'is_overdue' => $loan->isOverdue(),
                'is_pending' => $loan->isPending(),
                'can_cancel' => $loan->canBeCancelled(),
                'overdue_days' => $loan->overdue_days,
                'days_remaining' => $loan->days_remaining,
                'estimated_fine' => $loan->estimated_fine,
                'rejection_reason' => $loan->rejection_reason,
                'cancellation_reason' => $loan->cancellation_reason,
                'fine' => $loan->fine ? [
                    'id' => $loan->fine->id,
                    'amount' => $loan->fine->amount,
                    'late_days' => $loan->fine->late_days,
                    'status' => $loan->fine->status->value,
                ] : null,
            ];
        });

        // Calculate stats from all loans (not filtered by search)
        $allLoans = Loan::query()
            ->where('user_id', $user->id)
            ->with('fine')
            ->get();

        $totalLoans = $allLoans->count();
        $pendingLoans = $allLoans->where('status', LoanStatus::Pending)->count();
        $activeLoans = $allLoans->where('status', LoanStatus::Active)->count();
        $overdueLoans = $allLoans->filter(fn ($loan) => $loan->isOverdue())->count();
        $totalFines = $allLoans->sum(function ($loan) {
            if ($loan->fine) {
                return $loan->fine->amount;
            }
            if ($loan->isOverdue()) {
                return $loan->estimated_fine;
            }

            return 0;
        });

        return Inertia::render('loans/index', [
            'loans' => $loans,
            'stats' => [
                'totalLoans' => $totalLoans,
                'pendingLoans' => $pendingLoans,
                'activeLoans' => $activeLoans,
                'overdueLoans' => $overdueLoans,
                'totalFines' => $totalFines,
            ],
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Cancel a pending loan request.
     */
    public function cancel(Request $request, Loan $loan): RedirectResponse
    {
        $user = Auth::user();

        // Verify ownership
        if ($loan->user_id !== $user->id) {
            abort(403, 'Anda tidak memiliki akses ke peminjaman ini.');
        }

        // Verify loan can be cancelled
        if (! $loan->canBeCancelled()) {
            return back()->withErrors(['loan' => 'Peminjaman tidak dapat dibatalkan.']);
        }

        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $bookTitle = $loan->book->title;

        // Cancel the loan
        $loan->cancel($request->input('reason'));

        // Send notification to siswa (confirmation)
        $user->notify(NotificationBuilder::loanCancelled($loan));

        return back()->with('success', "Permintaan peminjaman buku \"{$bookTitle}\" berhasil dibatalkan.");
    }
}
