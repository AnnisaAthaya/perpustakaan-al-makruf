<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(): Response
    {
        /** @var User $user */
        $user = Auth::user();

        return Inertia::render('settings/index', [
            'profile' => [
                'id' => $user->id,
                'name' => $user->name,
                'nis' => $user->nis,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
                'class' => $user->full_class ?? ($user->class_name ? 'Kelas ' . $user->grade . ' ' . $user->class_name : '-'),
                'address' => $user->address ?? '',
                'avatar' => $user->avatar,
                'passwordChangedAt' => $user->password_changed_at?->toIso8601String(),
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'name.max' => 'Nama maksimal 255 karakter.',
            'phone.max' => 'Nomor telepon maksimal 20 karakter.',
            'address.max' => 'Alamat maksimal 500 karakter.',
        ]);

        $user->update($validated);

        return back()->with('success', 'Profil berhasil diperbarui.');
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ], [
            'current_password.required' => 'Password saat ini wajib diisi.',
            'current_password.current_password' => 'Password saat ini tidak sesuai.',
            'password.required' => 'Password baru wajib diisi.',
            'password.min' => 'Password baru minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak sesuai.',
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
            'password_changed_at' => now(),
        ]);

        return back()->with('success', 'Password berhasil diubah.');
    }
}
