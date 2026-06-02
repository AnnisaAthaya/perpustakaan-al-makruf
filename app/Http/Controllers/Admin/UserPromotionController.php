<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PromoteUsersRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserPromotionController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search', '');
        $filterGrade = $request->input('filter_grade', '');
        $filterClassName = $request->input('filter_class_name', '');

        // Build query
        $query = User::where('role', 'siswa');

        // Search by name or NIS
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('nis', 'like', "%{$search}%");
            });
        }

        // Filter by grade
        if ($filterGrade !== '') {
            if ($filterGrade === 'null') {
                $query->whereNull('grade');
            } else {
                $query->where('grade', (int) $filterGrade);
            }
        }

        // Filter by class name
        if ($filterClassName) {
            $query->where('class_name', 'like', "%{$filterClassName}%");
        }

        // Paginate with sorting
        $students = $query->orderBy('grade')
            ->orderBy('class_name')
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/users/promote', [
            'students' => $students,
            'filters' => [
                'search' => $search,
                'filter_grade' => $filterGrade,
                'filter_class_name' => $filterClassName,
            ],
        ]);
    }

    public function store(PromoteUsersRequest $request)
    {
        $validated = $request->validated();
        $targetGrade = $validated['target_grade'];
        $targetClassName = $validated['target_class_name'];
        $userIds = $validated['user_ids'];

        // Update grade dan class_name untuk siswa yang dipilih
        $affected = User::whereIn('id', $userIds)
            ->where('role', 'siswa')
            ->update([
                'grade' => $targetGrade,
                'class_name' => $targetClassName,
            ]);

        return redirect()
            ->route('admin.users.index')
            ->with('success', "Berhasil memindahkan {$affected} siswa ke kelas {$targetGrade} {$targetClassName}.");
    }
}
