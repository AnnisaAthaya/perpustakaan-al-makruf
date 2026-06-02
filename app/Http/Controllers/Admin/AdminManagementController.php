<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAdminRequest;
use App\Http\Requests\Admin\UpdateAdminRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class AdminManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->get('search');

        $admins = User::query()
            ->where('role', UserRole::Admin)
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('nis', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'nis' => $user->nis,
                'email' => $user->email,
                'phone' => $user->phone,
                'created_at' => $user->created_at->toDateString(),
            ]);

        $stats = [
            'total_admins' => User::query()->where('role', UserRole::Admin)->count(),
            'new_this_month' => User::query()
                ->where('role', UserRole::Admin)
                ->whereYear('created_at', now()->year)
                ->whereMonth('created_at', now()->month)
                ->count(),
        ];

        return Inertia::render('admin/admins/index', [
            'admins' => $admins,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/admins/create');
    }

    public function store(StoreAdminRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        // Generate default password from date of birth or use default
        if (! empty($validated['date_of_birth'])) {
            $defaultPassword = User::generateDefaultPassword($validated['date_of_birth']);
        } else {
            $defaultPassword = 'almaruf2024'; // Default password untuk admin tanpa tanggal lahir
        }

        User::create([
            'name' => $validated['name'],
            'nis' => $validated['nis'],
            'email' => $validated['email'],
            'date_of_birth' => $validated['date_of_birth'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'password' => Hash::make($defaultPassword),
            'role' => UserRole::Admin,
            'membership_status' => 'active',
            'grade' => null,
            'class_name' => null,
        ]);

        return redirect()
            ->route('admin.admins.index')
            ->with('success', 'Admin berhasil ditambahkan.');
    }

    public function edit(User $admin): Response
    {
        if ($admin->isSiswa()) {
            abort(404);
        }

        return Inertia::render('admin/admins/edit', [
            'admin' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'nis' => $admin->nis,
                'email' => $admin->email,
                'date_of_birth' => $admin->date_of_birth?->format('Y-m-d'),
                'phone' => $admin->phone,
                'address' => $admin->address,
                'is_using_default_password' => $admin->isUsingDefaultPassword(),
            ],
        ]);
    }

    public function update(UpdateAdminRequest $request, User $admin): RedirectResponse
    {
        if ($admin->isSiswa()) {
            abort(404);
        }

        $validated = $request->validated();

        $admin->update([
            'name' => $validated['name'],
            'nis' => $validated['nis'],
            'email' => $validated['email'],
            'date_of_birth' => $validated['date_of_birth'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
        ]);

        // Handle password reset to default
        if (! empty($validated['reset_password'])) {
            $admin->resetPasswordToDefault();
        } elseif (! empty($validated['password'])) {
            // Handle custom password change
            $admin->update([
                'password' => Hash::make($validated['password']),
                'password_changed_at' => now(),
            ]);
        }

        return redirect()
            ->route('admin.admins.index')
            ->with('success', 'Data admin berhasil diperbarui.');
    }

    public function destroy(User $admin): RedirectResponse
    {
        if ($admin->isSiswa()) {
            abort(404);
        }

        // Prevent deleting self
        if ($admin->id === auth()->id()) {
            return redirect()
                ->route('admin.admins.index')
                ->with('error', 'Tidak dapat menghapus akun Anda sendiri.');
        }

        $admin->delete();

        return redirect()
            ->route('admin.admins.index')
            ->with('success', 'Admin berhasil dihapus.');
    }
}
