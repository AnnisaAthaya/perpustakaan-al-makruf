<?php

namespace App\Http\Controllers\Admin;

use App\Enums\FileType;
use App\Enums\FineStatus;
use App\Http\Controllers\Controller;
use App\Models\Fine;
use App\Services\NotificationBuilder;
use App\Services\StorageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FineController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->get('search');

        $fines = Fine::query()
            ->with([
                'loan:id,user_id,book_id,borrowed_at,due_date,returned_at',
                'loan.user:id,name,nis',
                'loan.book:id,title,code',
            ])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->whereHas('loan.user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('nis', 'like', "%{$search}%");
                    })
                        ->orWhereHas('loan.book', function ($bookQuery) use ($search) {
                            $bookQuery->where('title', 'like', "%{$search}%");
                        });
                });
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        $finesData = $fines->through(function (Fine $fine) {
            return [
                'id' => $fine->id,
                'student' => [
                    'id' => $fine->loan->user->id,
                    'name' => $fine->loan->user->name,
                    'nis' => $fine->loan->user->nis,
                ],
                'book' => [
                    'id' => $fine->loan->book->id,
                    'title' => $fine->loan->book->title,
                    'code' => $fine->loan->book->code,
                ],
                'borrowed_at' => $fine->loan->borrowed_at,
                'returned_at' => $fine->loan->returned_at,
                'late_days' => $fine->late_days,
                'amount' => (int) $fine->amount,
                'status' => $fine->status->value,
                'payment_proof' => StorageService::url($fine->payment_proof, FileType::PaymentProof),
                'submitted_at' => $fine->submitted_at,
                'verified_at' => $fine->verified_at,
            ];
        });

        // Calculate stats from all fines (not filtered by search)
        $allFines = Fine::query()->get();
        $stats = [
            'total_fines' => $allFines->count(),
            'pending_verification' => $allFines->where('status', FineStatus::PendingVerification)->count(),
            'unpaid' => $allFines->where('status', FineStatus::Unpaid)->count(),
            'paid' => $allFines->where('status', FineStatus::Paid)->count(),
            'total_amount' => (int) $allFines->sum('amount'),
            'pending_amount' => (int) $allFines->whereIn('status', [FineStatus::Unpaid, FineStatus::PendingVerification])->sum('amount'),
        ];

        return Inertia::render('admin/fines/index', [
            'fines' => $finesData,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function show(Fine $fine): Response
    {
        // Load relationships
        $fine->load([
            'loan:id,user_id,book_id,borrowed_at,due_date,returned_at',
            'loan.user:id,name,nis,email',
            'loan.book:id,title,code,cover',
        ]);

        $fineData = [
            'id' => $fine->id,
            'student' => [
                'id' => $fine->loan->user->id,
                'name' => $fine->loan->user->name,
                'nis' => $fine->loan->user->nis,
                'email' => $fine->loan->user->email,
            ],
            'book' => [
                'id' => $fine->loan->book->id,
                'title' => $fine->loan->book->title,
                'code' => $fine->loan->book->code,
                'cover' => StorageService::url($fine->loan->book->cover, FileType::BookCover),
            ],
            'borrowed_at' => $fine->loan->borrowed_at,
            'due_date' => $fine->loan->due_date,
            'returned_at' => $fine->loan->returned_at,
            'late_days' => $fine->late_days,
            'amount' => (int) $fine->amount,
            'status' => $fine->status->value,
            'payment_proof' => StorageService::url($fine->payment_proof, FileType::PaymentProof),
            'submitted_at' => $fine->submitted_at,
            'verified_at' => $fine->verified_at,
            'notes' => $fine->notes,
        ];

        return Inertia::render('admin/fines/show', [
            'fine' => $fineData,
        ]);
    }

    public function verify(Fine $fine): RedirectResponse
    {
        if ($fine->status !== FineStatus::PendingVerification) {
            return redirect()
                ->route('admin.fines.index')
                ->with('error', 'Denda tidak dalam status menunggu verifikasi.');
        }

        $fine->verify(request()->user());

        // Send notification to siswa (payment verified)
        $fine->loan->user->notify(NotificationBuilder::fineVerified($fine));

        return redirect()
            ->route('admin.fines.index')
            ->with('success', 'Pembayaran denda berhasil diverifikasi.');
    }

    public function reject(Fine $fine): RedirectResponse
    {
        if ($fine->status !== FineStatus::PendingVerification) {
            return redirect()
                ->route('admin.fines.index')
                ->with('error', 'Denda tidak dalam status menunggu verifikasi.');
        }

        $fine->reject(request()->user());

        // Send notification to siswa (payment rejected)
        $fine->loan->user->notify(NotificationBuilder::fineRejected($fine, $fine->notes));

        return redirect()
            ->route('admin.fines.index')
            ->with('success', 'Bukti pembayaran ditolak. Siswa perlu mengunggah ulang.');
    }
}
