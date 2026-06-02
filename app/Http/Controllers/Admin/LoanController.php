<?php

namespace App\Http\Controllers\Admin;

use App\Enums\FileType;
use App\Enums\LoanStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\ProcessReturnRequest;
use App\Models\Loan;
use App\Services\NotificationBuilder;
use App\Services\StorageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class LoanController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->get('search');

        // Get pending count for stats
        $pendingCount = Loan::pending()->count();

        // Get active loans for stats
        $activeLoansQuery = Loan::query()
            ->with(['user', 'book'])
            ->where('status', LoanStatus::Active)
            ->get();

        $activeCount = $activeLoansQuery->filter(fn(Loan $loan) => ! $loan->isOverdue())->count();
        $overdueCount = $activeLoansQuery->filter(fn(Loan $loan) => $loan->isOverdue())->count();

        // Get all loans (pending + active) in one query
        $loans = Loan::query()
            ->with(['user', 'book'])
            ->whereIn('status', [LoanStatus::Pending, LoanStatus::Active])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->whereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('nis', 'like', "%{$search}%");
                    })
                        ->orWhereHas('book', function ($bookQuery) use ($search) {
                            $bookQuery->where('title', 'like', "%{$search}%");
                        });
                });
            })
            ->orderByRaw("CASE
                WHEN status = 'pending' THEN 1
                WHEN status = 'active' THEN 2
                ELSE 3
            END")
            ->orderByDesc('requested_at')
            ->paginate(20)
            ->withQueryString()
            ->through(fn(Loan $loan) => [
                'id' => $loan->id,
                'student' => [
                    'id' => $loan->user->id,
                    'name' => $loan->user->name,
                    'nis' => $loan->user->nis,
                ],
                'book' => [
                    'id' => $loan->book->id,
                    'title' => $loan->book->title,
                    'code' => $loan->book->code,
                    'cover' => StorageService::url($loan->book->cover, FileType::BookCover),
                ],
                'requested_at' => $loan->requested_at,
                'borrowed_at' => $loan->borrowed_at,
                'due_date' => $loan->due_date,
                'status' => $loan->status->value === 'pending' ? 'pending' : ($loan->isOverdue() ? 'overdue' : 'active'),
                'days_remaining' => $loan->days_remaining ?? null,
                'overdue_days' => $loan->overdue_days ?? null,
                'estimated_fine' => $loan->estimated_fine ?? null,
            ]);

        $stats = [
            'pending_loans' => $pendingCount,
            'active_loans' => $activeCount,
            'overdue_loans' => $overdueCount,
            'total_borrowers' => $activeLoansQuery->pluck('user_id')->unique()->count(),
        ];

        return Inertia::render('admin/loans/index', [
            'loans' => $loans,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function show(Loan $loan): Response
    {
        $loan->load(['user', 'book']);

        // Determine status
        $status = match ($loan->status) {
            LoanStatus::Pending => 'pending',
            LoanStatus::Rejected => 'rejected',
            LoanStatus::Cancelled => 'cancelled',
            LoanStatus::Returned => 'returned',
            LoanStatus::Active => $loan->isOverdue() ? 'overdue' : 'active',
            default => 'active',
        };

        return Inertia::render('admin/loans/show', [
            'loan' => [
                'id' => $loan->id,
                'student' => [
                    'id' => $loan->user->id,
                    'name' => $loan->user->name,
                    'nis' => $loan->user->nis,
                    'email' => $loan->user->email,
                ],
                'book' => [
                    'id' => $loan->book->id,
                    'title' => $loan->book->title,
                    'code' => $loan->book->code,
                    'publisher' => $loan->book->publisher,
                    'cover' => StorageService::url($loan->book->cover, FileType::BookCover),
                ],
                'requested_at' => $loan->requested_at,
                'borrowed_at' => $loan->borrowed_at,
                'due_date' => $loan->due_date,
                'status' => $status,
                'days_remaining' => $loan->days_remaining,
                'overdue_days' => $loan->overdue_days,
                'estimated_fine' => $loan->estimated_fine,
                'notes' => $loan->notes,
                'rejection_reason' => $loan->rejection_reason,
            ],
        ]);
    }

    public function approve(Loan $loan): RedirectResponse
    {
        if (! $loan->isPending()) {
            return redirect()
                ->route('admin.loans.index')
                ->with('error', 'Peminjaman ini tidak dapat disetujui.');
        }

        $loan->approve(auth()->id());

        // Send notification to siswa
        $loan->user->notify(NotificationBuilder::loanApproved($loan));

        // Invalidate user stats cache since active loans changed
        Cache::forget('admin.users.stats');

        return redirect()
            ->route('admin.loans.index')
            ->with('success', 'Peminjaman berhasil disetujui. Buku dapat diambil oleh siswa.');
    }

    public function reject(Request $request, Loan $loan): RedirectResponse
    {
        if (! $loan->isPending()) {
            return redirect()
                ->route('admin.loans.index')
                ->with('error', 'Peminjaman ini tidak dapat ditolak.');
        }

        $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $loan->reject(auth()->id(), $request->input('reason'));

        // Send notification to siswa
        $loan->user->notify(NotificationBuilder::loanRejected($loan, $request->input('reason')));

        return redirect()
            ->route('admin.loans.index')
            ->with('success', 'Peminjaman berhasil ditolak.');
    }

    public function processReturn(ProcessReturnRequest $request, Loan $loan): RedirectResponse
    {
        if ($loan->status !== LoanStatus::Active) {
            return redirect()
                ->route('admin.loans.index')
                ->with('error', 'Peminjaman ini sudah dikembalikan.');
        }

        $adjustedAmount = $request->input('adjusted_amount');
        $adjustmentReason = $request->input('adjustment_reason');
        $adjustedBy = $adjustedAmount !== null ? auth()->id() : null;

        $loan->markAsReturned($adjustedAmount, $adjustmentReason, $adjustedBy);

        // Send notification to siswa - book returned
        $loan->user->notify(NotificationBuilder::bookReturned($loan));

        // If there's a fine, send fine notification
        if ($loan->overdue_days > 0 && $loan->fine) {
            $loan->user->notify(NotificationBuilder::fineCreated($loan->fine));
        }

        // Invalidate user stats cache since active loans changed
        Cache::forget('admin.users.stats');

        $message = 'Buku berhasil dikembalikan.';
        if ($loan->overdue_days > 0) {
            $finalAmount = $loan->fine->getFinalAmount();

            if ($adjustedAmount !== null) {
                $message .= ' Denda disesuaikan menjadi Rp ' . number_format($finalAmount, 0, ',', '.') . '.';
            } else {
                $message .= ' Denda sebesar Rp ' . number_format($finalAmount, 0, ',', '.') . ' telah dicatat.';
            }
        }

        return redirect()
            ->route('admin.loans.index', ['filter' => 'active'])
            ->with('success', $message);
    }
}
