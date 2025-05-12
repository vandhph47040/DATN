<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        // Nếu $roles chứa chuỗi có dấu "|", phân tách nó thành mảng
        if (count($roles) === 1 && strpos($roles[0], '|') !== false) {
            $roles = explode('|', $roles[0]);
        }

        if (!$user || !in_array($user->role, $roles)) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Bạn không có quyền truy cập!',
                    'user_role' => $user ? $user->role : 'No user',
                    'allowed_roles' => $roles
                ], 403);
            }
            abort(403, 'Bạn không có quyền truy cập!');
        }

        return $next($request);
    }
}
