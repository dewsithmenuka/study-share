<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class EnsureValidSession
{
    public function handle(Request $request, Closure $next)
    {
        // If user is authenticated but session is empty, regenerate it
        if (Auth::check() && !Session::has('_token_validated')) {
            Session::regenerate();
            Session::put('_token_validated', true);
        }

        return $next($request);
    }
}