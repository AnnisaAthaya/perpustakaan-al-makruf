<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureIsSiswa
{
    /**
     * Handle an incoming request.
     * Only allow siswa (student) users to access these routes.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        /** @var User|null $user */
        $user = Auth::user();

        if (! $user || ! $user->isSiswa()) {
            if ($user && $user->isAdmin()) {
                return redirect()->route('admin.dashboard');
            }

            return redirect()->route('auth.login');
        }

        return $next($request);
    }
}
