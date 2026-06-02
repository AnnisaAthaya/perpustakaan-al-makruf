<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Http\Requests\Siswa\StoreLibraryVisitRequest;
use App\Models\LibraryVisit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class LibraryVisitController extends Controller
{
    /**
     * Display the library visit page with form and history.
     */
    public function index(): Response
    {
        $user = Auth::user();

        // Check if user has visited today
        $todayVisit = LibraryVisit::query()
            ->where('user_id', $user->id)
            ->whereDate('visited_at', today())
            ->first();

        // Get recent visit history (last 10 visits)
        $recentVisits = LibraryVisit::query()
            ->where('user_id', $user->id)
            ->orderByDesc('visited_at')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(function ($visit) {
                return [
                    'id' => $visit->id,
                    'visited_at' => $visit->visited_at->toDateString(),
                    'visited_at_formatted' => $visit->visited_at->translatedFormat('d F Y'),
                    'time' => $visit->created_at->format('H:i'),
                    'notes' => $visit->notes,
                ];
            });

        return Inertia::render('visits/index', [
            'has_visited_today' => ! is_null($todayVisit),
            'today_visit' => $todayVisit ? [
                'id' => $todayVisit->id,
                'visited_at' => $todayVisit->visited_at->toDateString(),
                'time' => $todayVisit->created_at->format('H:i'),
                'notes' => $todayVisit->notes,
            ] : null,
            'recent_visits' => $recentVisits->all(),
            'user' => [
                'name' => $user->name,
                'nis' => $user->nis,
                'grade' => $user->grade,
                'class_name' => $user->class_name,
                'full_class' => $user->full_class,
            ],
        ]);
    }

    /**
     * Store a new library visit record.
     */
    public function store(StoreLibraryVisitRequest $request): RedirectResponse
    {
        $user = Auth::user();

        try {
            // Check if user has already visited today
            $existingVisit = LibraryVisit::query()
                ->where('user_id', $user->id)
                ->whereDate('visited_at', today())
                ->exists();

            if ($existingVisit) {
                return back()->withErrors([
                    'visit' => 'Anda sudah mengisi kunjungan hari ini.',
                ]);
            }

            // Create the visit record
            LibraryVisit::create([
                'user_id' => $user->id,
                'visited_at' => today(),
                'notes' => $request->input('notes'),
            ]);

            return back()->with('success', 'Kunjungan berhasil dicatat. Terima kasih!');
        } catch (\Exception $e) {
            // Handle unique constraint violation or other errors
            if (str_contains($e->getMessage(), 'UNIQUE constraint failed')) {
                return back()->withErrors([
                    'visit' => 'Anda sudah mengisi kunjungan hari ini.',
                ]);
            }

            return back()->withErrors([
                'visit' => 'Terjadi kesalahan saat mencatat kunjungan. Silakan coba lagi.',
            ]);
        }
    }
}
