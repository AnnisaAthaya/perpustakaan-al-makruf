<?php

namespace App\Http\Controllers\Siswa;

use App\Enums\FileType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Siswa\UploadPaymentProofRequest;
use App\Models\Fine;
use App\Models\Setting;
use App\Models\User;
use App\Services\NotificationBuilder;
use App\Services\StorageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

class FineController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $search = $request->get('search');

        // Get all fines for the user (through loans)
        $finesQuery = Fine::query()
            ->whereHas('loan', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->with(['loan.book.category'])
            ->when($search, function ($query, $search) {
                $query->whereHas('loan.book', function ($bookQuery) use ($search) {
                    $bookQuery->where('title', 'like', "%{$search}%");
                });
            })
            ->orderByRaw("CASE 
                WHEN status = 'unpaid' THEN 1 
                WHEN status = 'pending_verification' THEN 2 
                ELSE 3 
            END")
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        // Calculate stats from all fines (not filtered by search)
        $allFines = Fine::query()
            ->whereHas('loan', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->get();

        $unpaidFines = $allFines->where('status.value', 'unpaid');
        $pendingFines = $allFines->where('status.value', 'pending_verification');
        $paidFines = $allFines->where('status.value', 'paid');

        return Inertia::render('fines/index', [
            'fines' => $finesQuery,
            'qrisImage' => Setting::getQrisImage(),
            'finePerDay' => Setting::getFinePerDay(),
            'stats' => [
                'unpaidCount' => $unpaidFines->count(),
                'pendingCount' => $pendingFines->count(),
                'paidCount' => $paidFines->count(),
                'totalUnpaid' => $unpaidFines->sum('amount'),
            ],
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function uploadProof(UploadPaymentProofRequest $request, Fine $fine): RedirectResponse
    {
        $user = Auth::user();

        // Ensure the fine belongs to the current user
        if ($fine->loan->user_id !== $user->id) {
            return back()->with('error', 'Anda tidak memiliki akses ke denda ini.');
        }

        // Ensure the fine is still unpaid
        if ($fine->status->value !== 'unpaid') {
            return back()->with('error', 'Denda ini sudah dibayar atau sedang dalam proses verifikasi.');
        }

        // Validation sudah dilakukan di UploadPaymentProofRequest
        $path = StorageService::upload($request->file('payment_proof'), FileType::PaymentProof);

        // Update the fine with payment proof
        $fine->submitPaymentProof($path);

        // Send notification to siswa (confirmation)
        $user->notify(NotificationBuilder::fineProofUploaded($fine));

        // Send notification to all admins (new payment proof to verify)
        $admins = User::where('role', 'admin')->get();
        Notification::send($admins, NotificationBuilder::fineProofSubmitted($fine));

        return back()->with('success', 'Bukti pembayaran berhasil dikirim. Mohon tunggu verifikasi dari admin.');
    }
}
