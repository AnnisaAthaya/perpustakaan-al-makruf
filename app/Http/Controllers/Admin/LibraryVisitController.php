<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LibraryVisit;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LibraryVisitController extends Controller
{
    /**
     * Display library visits with statistics and filtering.
     */
    public function index(Request $request): Response
    {
        // Get filter date (default to today)
        $filterDate = $request->get('date', today()->toDateString());
        $search = $request->get('search', '');

        try {
            $date = Carbon::parse($filterDate);
        } catch (\Exception $e) {
            $date = today();
        }

        // Get visits for the filtered date
        $visitsQuery = LibraryVisit::query()
            ->with('user')
            ->whereDate('visited_at', $date);

        // Apply search filter
        if ($search) {
            $visitsQuery->whereHas('user', function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('nis', 'like', "%{$search}%");
            });
        }

        $visits = $visitsQuery
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->through(function ($visit) {
                return [
                    'id' => $visit->id,
                    'student' => [
                        'id' => $visit->user->id,
                        'name' => $visit->user->name,
                        'nis' => $visit->user->nis,
                        'grade' => $visit->user->grade,
                        'class_name' => $visit->user->class_name,
                        'full_class' => $visit->user->full_class,
                    ],
                    'visited_at' => $visit->visited_at->toDateString(),
                    'visited_at_formatted' => $visit->visited_at->translatedFormat('d F Y'),
                    'time' => $visit->created_at->format('H:i'),
                    'notes' => $visit->notes,
                ];
            });

        // Calculate statistics
        $todayCount = LibraryVisit::query()
            ->whereDate('visited_at', today())
            ->count();

        $thisWeekCount = LibraryVisit::query()
            ->whereBetween('visited_at', [
                today()->startOfWeek(),
                today()->endOfWeek(),
            ])
            ->count();

        $thisMonthCount = LibraryVisit::query()
            ->whereYear('visited_at', today()->year)
            ->whereMonth('visited_at', today()->month)
            ->count();

        $stats = [
            'today' => $todayCount,
            'this_week' => $thisWeekCount,
            'this_month' => $thisMonthCount,
        ];

        return Inertia::render('admin/visits/index', [
            'visits' => $visits,
            'stats' => $stats,
            'filters' => [
                'date' => $date->toDateString(),
                'search' => $search,
            ],
        ]);
    }
}
