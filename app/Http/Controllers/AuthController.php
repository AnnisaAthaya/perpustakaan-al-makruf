<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    /**
     * Display the login page.
     */
    public function showLogin(): Response
    {
        return Inertia::render('auth/login');
    }

    /**
     * Handle login request.
     * Supports login with NIS or Email.
     */
    public function login(LoginRequest $request): RedirectResponse
    {
        $identifier = $request->validated('identifier');
        $password = $request->validated('password');

        // Try to find user by NIS or Email
        $user = User::query()
            ->where('nis', $identifier)
            ->orWhere('email', $identifier)
            ->first();

        if (! $user || ! Auth::attempt(['email' => $user->email, 'password' => $password])) {
            return back()->withErrors([
                'identifier' => 'NIS/Email atau password salah.',
            ])->onlyInput('identifier');
        }

        $request->session()->regenerate();

        // Check if user needs to change password (siswa with default password)
        if ($user->mustChangePassword()) {
            return redirect()->route('auth.change-password');
        }

        // Redirect based on role
        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        return redirect()->route('home');
    }

    /**
     * Logout the user.
     */
    public function logout(): RedirectResponse
    {
        Auth::logout();

        request()->session()->invalidate();
        request()->session()->regenerateToken();

        return redirect()->route('auth.login');
    }
}
