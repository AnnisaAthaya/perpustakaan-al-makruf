<?php

namespace App\Http\Controllers\Siswa;

use App\Enums\FineStatus;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ClearanceController extends Controller
{
    public function index(): Response
    {
        /** @var User $user */
        $user = Auth::user();

        // Get active loans count
        $activeLoanCount = $user->activeLoans()->count();

        // Get unpaid fines info
        $unpaidFines = $user->loans()
            ->whereHas('fine', fn ($q) => $q->where('status', '!=', FineStatus::Paid))
            ->with('fine')
            ->get();

        $unpaidFineCount = $unpaidFines->count();
        $unpaidFineTotal = $unpaidFines->sum(fn ($loan) => $loan->fine?->amount ?? 0);

        // Check if membership is active
        $isMembershipActive = $user->membership_status->value === 'active';

        // Check if grade 12 (eligible for clearance)
        $isGrade12 = $user->grade === 12;

        // Build requirements
        $requirements = [
            [
                'id' => 'grade-12',
                'label' => 'Siswa Kelas XII',
                'description' => 'Bebas pustaka hanya untuk siswa kelas XII',
                'isMet' => $isGrade12,
                'detail' => ! $isGrade12 ? 'Anda bukan siswa kelas XII' : null,
            ],
            [
                'id' => 'no-active-loans',
                'label' => 'Tidak Ada Buku yang Dipinjam',
                'description' => 'Semua buku yang dipinjam sudah dikembalikan',
                'isMet' => $activeLoanCount === 0,
                'detail' => $activeLoanCount > 0 ? "{$activeLoanCount} buku masih dipinjam" : null,
                'actionLink' => $activeLoanCount > 0 ? '/returns' : null,
                'actionLabel' => 'Kembalikan Buku',
            ],
            [
                'id' => 'no-unpaid-fines',
                'label' => 'Tidak Ada Denda Belum Bayar',
                'description' => 'Semua denda keterlambatan sudah dilunasi',
                'isMet' => $unpaidFineCount === 0,
                'detail' => $unpaidFineCount > 0 ? 'Rp '.number_format($unpaidFineTotal, 0, ',', '.').' denda belum dibayar' : null,
                'actionLink' => $unpaidFineCount > 0 ? '/fines' : null,
                'actionLabel' => 'Bayar Denda',
            ],
            [
                'id' => 'good-standing',
                'label' => 'Status Anggota Aktif',
                'description' => 'Keanggotaan perpustakaan masih aktif',
                'isMet' => $isMembershipActive,
                'detail' => ! $isMembershipActive ? 'Keanggotaan Anda tidak aktif' : null,
            ],
        ];

        // Check if all requirements are met
        $isEligible = $user->canGetClearance();

        return Inertia::render('clearance/index', [
            'clearanceStatus' => [
                'isEligible' => $isEligible,
                'studentName' => $user->name,
                'studentNis' => $user->nis,
                'studentClass' => $user->full_class ?? 'Kelas '.$user->grade.' '.$user->class_name,
                'requirements' => $requirements,
                'activeLoanCount' => $activeLoanCount,
                'unpaidFineCount' => $unpaidFineCount,
                'unpaidFineTotal' => $unpaidFineTotal,
                'lastUpdated' => now()->toIso8601String(),
            ],
        ]);
    }
}
