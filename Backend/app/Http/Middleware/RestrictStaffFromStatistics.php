<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RestrictStaffFromStatistics
{
    
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if ($user && $user->role === 'staff') {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Nhân viên không có quyền truy cập thống kê!'], 403);
            }
            abort(403, 'Nhân viên không có quyền truy cập thống kê!');
        }

        return $next($request);
    }
}