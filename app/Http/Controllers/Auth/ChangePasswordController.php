<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ChangePasswordController extends Controller
{
    /**
     * Display the change password page.
     */
    public function show(): Response
    {
        /** @var User $user */
        $user = Auth::user();

        return Inertia::render('auth/change-password', [
            'user' => [
                'name' => $user->name,
                'nis' => $user->nis,
            ],
        ]);
    }

    /**
     * Handle password change request.
     */
    public function update(ChangePasswordRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $user->changePassword($request->validated('password'));

        return redirect()->route('home')->with('success', 'Password berhasil diubah! Selamat datang di MA Al-Ma\'ruf.');
    }
}
