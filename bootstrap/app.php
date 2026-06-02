<?php

use App\Http\Middleware\EnsureIsAdmin;
use App\Http\Middleware\EnsureIsSiswa;
use App\Http\Middleware\EnsurePasswordChanged;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RedirectIfAdmin;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');

        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'admin' => EnsureIsAdmin::class,
            'siswa' => EnsureIsSiswa::class,
            'password.changed' => EnsurePasswordChanged::class,
            'redirect.admin' => RedirectIfAdmin::class,
        ]);

        // Redirect guests to auth.login instead of default 'login'
        $middleware->redirectGuestsTo('/auth/login');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
