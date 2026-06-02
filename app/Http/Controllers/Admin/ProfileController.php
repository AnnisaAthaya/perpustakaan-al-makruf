<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateAdminPasswordRequest;
use App\Http\Requests\Admin\UpdateAdminProfileRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function index(): Response
    {
        /** @var \App\Models\User $user */
        $user = request()->user();

        return Inertia::render('admin/profile/index', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role->value,
                'created_at' => $user->created_at->toISOString(),
            ],
        ]);
    }

    public function update(UpdateAdminProfileRequest $request): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $user->update($request->validated());

        return redirect()
            ->route('admin.profile.index')
            ->with('success', 'Profil berhasil diperbarui.');
    }

    public function updatePassword(UpdateAdminPasswordRequest $request): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $user->update([
            'password' => Hash::make($request->validated('password')),
        ]);

        return redirect()
            ->route('admin.profile.index')
            ->with('success', 'Password berhasil diubah.');
    }
}
