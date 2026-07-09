<?php

namespace App\Http\Controllers\Admin;

use App\Enums\FileType;
use App\Enums\FineStatus;
use App\Http\Controllers\Controller;
use App\Models\Loan;
use App\Services\StorageService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReturnController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->get('search');

        $loans = Loan::query()
            ->returned()
            ->with(['user:id,name,nis', 'book:id,title,code,cover', 'fine'])
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
            ->latest('returned_at')
            ->paginate(20)
            ->withQueryString();

        $returns = $loans->through(function (Loan $loan) {
            $lateDays = $loan->overdue_days;
            $hasFine = $loan->fine !== null;

            // Determine fine status
            $fineStatus = 'no_fine';
            if ($hasFine) {
                $fineStatus = $loan->fine->status->value;
            }

            return [
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
                'borrowed_at' => $loan->borrowed_at,
                'due_date' => $loan->due_date,
                'returned_at' => $loan->returned_at,
                'status' => $lateDays > 0 ? 'late' : 'on_time',
                'late_days' => $lateDays,
                'fine_amount' => $hasFine ? (int) $loan->fine->amount : 0,
                'fine_status' => $fineStatus,
            ];
        });

        // Calculate stats from all returns (not filtered by search)
        $allLoans = Loan::query()
            ->returned()
            ->with('fine')
            ->get();

        $allReturns = $allLoans->map(function (Loan $loan) {
            $lateDays = $loan->overdue_days;
            $hasFine = $loan->fine !== null;
            $fineStatus = 'no_fine';
            if ($hasFine) {
                $fineStatus = $loan->fine->status->value;
            }

            return [
                'status' => $lateDays > 0 ? 'late' : 'on_time',
                'fine_status' => $fineStatus,
            ];
        });

        $totalReturns = $allReturns->count();
        $onTimeReturns = $allReturns->where('status', 'on_time')->count();
        $lateReturns = $allReturns->where('status', 'late')->count();
        $pendingFines = $allReturns->whereIn('fine_status', ['unpaid', 'pending_verification'])->count();

        $stats = [
            'total_returns' => $totalReturns,
            'on_time_returns' => $onTimeReturns,
            'late_returns' => $lateReturns,
            'pending_fines' => $pendingFines,
        ];

        return Inertia::render('admin/returns/index', [
            'returns' => $returns,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function show(Loan $loan): Response
    {
        // Load relationships
        $loan->load(['user:id,name,nis,email', 'book:id,title,code,cover,publisher', 'fine']);

        $lateDays = $loan->overdue_days;
        $hasFine = $loan->fine !== null;

        // Determine fine status
        $fineStatus = 'no_fine';
        $fineAmount = 0;
        $finePaidAt = null;
        $paymentProofUrl = null;

        if ($hasFine) {
            $fineStatus = $loan->fine->status->value;
            $fineAmount = (int) $loan->fine->amount;
            $finePaidAt = $loan->fine->status === FineStatus::Paid && $loan->fine->verified_at
                ? $loan->fine->verified_at
                : null;

            $paymentProofUrl = $loan->fine->payment_proof
                ? StorageService::url($loan->fine->payment_proof, FileType::PaymentProof)
                : null;
        }

        $returnData = [
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
            'borrowed_at' => $loan->borrowed_at,
            'due_date' => $loan->due_date,
            'returned_at' => $loan->returned_at,
            'status' => $lateDays > 0 ? 'late' : 'on_time',
            'late_days' => $lateDays,
            'fine_amount' => $fineAmount,
            'fine_status' => $fineStatus,
            'fine_paid_at' => $finePaidAt,
            'notes' => $loan->notes,
            'payment_proof' => $paymentProofUrl,
        ];

        return Inertia::render('admin/returns/show', [
            'returnData' => $returnData,
        ]);
    }
}
