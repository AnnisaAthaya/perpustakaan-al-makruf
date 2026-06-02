<?php

namespace App\Http\Controllers\Admin;

use App\Enums\MembershipStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->get('search');

        $users = User::query()
            ->where('role', UserRole::Siswa)
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('nis', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->withCount(['loans', 'activeLoans'])
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'nis' => $user->nis,
                'email' => $user->email,
                'full_class' => $user->full_class,
                'active_loans' => $user->active_loans_count,
                'total_loans' => $user->loans_count,
                'created_at' => $user->created_at->toDateString(),
            ]);

        // Get stats from all users (not filtered) - optimized for performance with 5-minute cache
        $stats = Cache::remember('admin.users.stats', 300, function () {
            return [
                // Direct count - fast database aggregation
                'total_users' => User::query()
                    ->where('role', UserRole::Siswa)
                    ->count(),

                // Count users with active loans using efficient whereHas
                'active_borrowers' => User::query()
                    ->where('role', UserRole::Siswa)
                    ->whereHas('activeLoans')
                    ->count(),

                // Count new users this month
                'new_this_month' => User::query()
                    ->where('role', UserRole::Siswa)
                    ->whereYear('created_at', Carbon::now()->year)
                    ->whereMonth('created_at', Carbon::now()->month)
                    ->count(),
            ];
        });

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/users/create');
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        // Generate default password from date of birth (format: ddmmyyyy)
        $defaultPassword = User::generateDefaultPassword($validated['date_of_birth']);

        User::create([
            'name' => $validated['name'],
            'nis' => $validated['nis'],
            'email' => $validated['email'],
            'date_of_birth' => $validated['date_of_birth'],
            'phone' => $validated['phone'] ?? null,
            'grade' => $validated['grade'],
            'class_name' => $validated['class_name'],
            'address' => $validated['address'] ?? null,
            'password' => Hash::make($defaultPassword),
            'role' => UserRole::Siswa,
            'membership_status' => MembershipStatus::Active,
        ]);

        // Invalidate stats cache after creating a user
        Cache::forget('admin.users.stats');

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'Siswa berhasil ditambahkan.');
    }

    public function edit(User $user): Response
    {
        if ($user->isAdmin()) {
            abort(404);
        }

        $membershipStatuses = collect(MembershipStatus::cases())->map(fn (MembershipStatus $status) => [
            'value' => $status->value,
            'label' => $status->label(),
        ]);

        return Inertia::render('admin/users/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'nis' => $user->nis,
                'email' => $user->email,
                'date_of_birth' => $user->date_of_birth?->format('Y-m-d'),
                'phone' => $user->phone,
                'grade' => $user->grade,
                'class_name' => $user->class_name,
                'address' => $user->address,
                'membership_status' => $user->membership_status->value,
                'is_using_default_password' => $user->isUsingDefaultPassword(),
            ],
            'membershipStatuses' => $membershipStatuses,
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        if ($user->isAdmin()) {
            abort(404);
        }

        $validated = $request->validated();

        $user->update([
            'name' => $validated['name'],
            'nis' => $validated['nis'],
            'email' => $validated['email'],
            'date_of_birth' => $validated['date_of_birth'],
            'phone' => $validated['phone'] ?? null,
            'grade' => $validated['grade'],
            'class_name' => $validated['class_name'],
            'address' => $validated['address'] ?? null,
            'membership_status' => $validated['membership_status'],
        ]);

        // Handle password reset to default
        if (! empty($validated['reset_password'])) {
            $user->resetPasswordToDefault();
        } elseif (! empty($validated['password'])) {
            // Handle custom password change
            $user->update([
                'password' => Hash::make($validated['password']),
                'password_changed_at' => now(),
            ]);
        }

        // Invalidate stats cache after updating a user
        Cache::forget('admin.users.stats');

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'Data siswa berhasil diperbarui.');
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->isAdmin()) {
            abort(404);
        }

        if ($user->hasActiveLoans()) {
            return redirect()
                ->route('admin.users.index')
                ->with('error', 'Tidak dapat menghapus siswa yang masih memiliki peminjaman aktif.');
        }

        $user->delete();

        // Invalidate stats cache after deleting a user
        Cache::forget('admin.users.stats');

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'Siswa berhasil dihapus.');
    }
}
