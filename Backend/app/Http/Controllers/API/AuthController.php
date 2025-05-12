<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Mail\ResetPassword;
use App\Mail\VerifyEmail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    // API Đăng ký tài khoản (Gửi OTP qua email)
    public function register(Request $request)
    {
        // Xóa dấu cách trong mật khẩu trước khi validate
        $passwordWithoutSpaces = preg_replace('/\s+/', '', $request->input('password'));

        // Thay thế giá trị trong request để validate
        $request->merge([
            'password' => $passwordWithoutSpaces,
            'password_confirmation' => preg_replace('/\s+/', '', $request->input('password_confirmation')),
        ]);

        // Validate dữ liệu
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|min:2|max:50',
            'email' => 'required|string|email|min:5|max:255|unique:users',
            'password' => [
                'required',
                'string',
                'confirmed',
                'min:6',
                'max:20',
                'regex:/^(?=.*[A-Z])(?=.*[a-zA-Z])(?=.*\d).{8,20}$/', // Ít nhất 1 chữ in hoa, có cả chữ và số
                'different:email', // Không trùng với email
            ],
            'phone' => 'required|numeric|digits_between:10,15|unique:users,phone',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Chỉ cho phép 1 tài khoản admin
        if ($request->has('role') && $request->role === 'admin') {
            if (User::where('role', 'admin')->exists()) {
                return response()->json(['message' => 'Chỉ một tài khoản quản trị được phép tồn tại.'], 403);
            }
        }

        // Xác định vai trò (mặc định là "customer")
        $allowedRoles = ['admin', 'staff', 'customer'];
        $role = $request->has('role') && in_array($request->role, $allowedRoles) ? $request->role : 'customer';

        // Tạo mã OTP ngẫu nhiên (6 số)
        $verificationCode = random_int(100000, 999999);

        // Lưu OTP vào cache (10 phút)
        Cache::put('verify_code:' . $request->email, [
            'code' => $verificationCode,
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password, // Chưa mã hóa, mã hóa sau khi xác thực
            'phone' => $request->phone,
            'role' => $role,
        ], now()->addMinutes(10));

        // Để gửi email xác thực
        Mail::to($request->email)->send(new VerifyEmail($verificationCode));

        return response()->json(['message' => 'Mã xác thực đã gửi đến email. Vui lòng kiểm tra và nhập mã để hoàn tất.', 'expires_at' => now()->addMinutes(10)]);
    }

    // API Xác thực OTP để hoàn tất đăng ký
    public function verifyCode(Request $request)
    {
        // Validate
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'code' => 'required|digits:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Lấy dữ liệu OTP từ cache
        $cachedData = Cache::get('verify_code:' . $request->email);

        if (!$cachedData || $request->code != $cachedData['code']) {
            return response()->json(['message' => 'Mã xác thực không đúng hoặc đã hết hạn.'], 400);
        }

        // Xóa OTP sau khi xác thực
        Cache::forget('verify_code:' . $request->email);

        // Lưu user vào database
        $user = User::create([
            'name' => $cachedData['name'],
            'email' => $cachedData['email'],
            'password' => Hash::make($cachedData['password']), // Mã hóa mật khẩu
            'phone' => $cachedData['phone'],
            'role' => $cachedData['role'],
            'is_verified' => true,
        ]);

        // Tạo token đăng nhập
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Tài khoản đã được xác thực và đăng ký thành công.',
            'token' => $token,
        ]);
    }

    // API Quên mật khẩu (Gửi OTP đặt lại mật khẩu)
    public function forgotPassword(Request $request)
    {
        // Validate
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Tạo OTP mới (6 số)
        $otp = random_int(100000, 999999);

        // Lưu OTP vào cache (10 phút)
        Cache::put('reset_password:' . $request->email, $otp, now()->addMinutes(10));

        // Để gửi email reset password
        Mail::to($request->email)->send(new ResetPassword($otp));

        return response()->json(['message' => 'Mã OTP đặt lại mật khẩu đã được gửi.']);
    }

    // API Xác nhận OTP và đặt lại mật khẩu mới
    public function resetPassword(Request $request)
    {
        // Xóa dấu cách trong mật khẩu trước khi validate
        $passwordWithoutSpaces = preg_replace('/\s+/', '', $request->input('new_password'));

        // Thay thế giá trị trong request để validate
        $request->merge([
            'new_password' => $passwordWithoutSpaces,
            'new_password_confirmation' => preg_replace('/\s+/', '', $request->input('new_password_confirmation')),
        ]);

        // Validate
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|digits:6',
            'new_password' => [
                'required',
                'string',
                'confirmed',
                'min:6',
                'max:20',
                'regex:/^(?=.*[A-Z])(?=.*[a-zA-Z])(?=.*\d).{6,12}$/', // Ít nhất 1 chữ in hoa, có cả chữ và số
                'different:email', // Không trùng với email
            ],
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Lấy OTP từ cache
        $cachedOtp = Cache::get('reset_password:' . $request->email);

        if (!$cachedOtp || $request->otp != $cachedOtp) {
            return response()->json(['message' => 'Mã OTP không đúng hoặc đã hết hạn.'], 400);
        }

        // Xóa OTP sau khi xác thực thành công
        Cache::forget('reset_password:' . $request->email);

        // Cập nhật mật khẩu mới
        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json(['message' => 'Mật khẩu đã được đặt lại thành công.']);
    }

    // API Gửi lại mã xác thực email (OTP mới)
    public function resendVerificationEmail(Request $request)
    {
        // Validate
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Kiểm tra email trong cache
        $cachedData = Cache::get('verify_code:' . $request->email);

        if (!$cachedData) {
            return response()->json(['message' => 'Mã xác thực đã hết hạn. Vui lòng đăng ký lại.'], 400);
        }

        // Tạo mã xác thực mới
        $verificationCode = random_int(100000, 999999);
        $cachedData['code'] = $verificationCode;

        // Lưu lại cache với TTL mới
        Cache::put('verify_code:' . $request->email, $cachedData, now()->addMinutes(10));

        // Để gửi email xác thực
        Mail::to($request->email)->send(new VerifyEmail($verificationCode));

        return response()->json(['message' => 'Mã xác thực đã được gửi lại.']);
    }

    public function login(Request $request)
    {
        // Validate request
        $validator = Validator::make(
            $request->all(),
            [
                'email' => 'required|string|email|max:255',
                'password' => 'required|string|min:6|max:100',
            ]
        );

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Kiểm tra user
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Tài khoản hoặc mật khẩu không chính xác'], 401);
        }

        if (!$user->is_verified) {
            return response()->json(['message' => 'Tài khoản chưa xác thực. Vui lòng kiểm tra email.'], 403);
        }

        // Kiểm tra nếu user đã có token hợp lệ (đã đăng nhập)
        if ($user->tokens()->count() > 0) {
            return response()->json(['message' => 'Tài khoản này đang đăng nhập trên một thiết bị khác.'], 409);
        }

        // Đăng nhập thành công, tạo API token
        $token = $user->createToken('auth_token')->plainTextToken;
        $redirectUrl = in_array($user->role, ['admin', 'staff']) ? '/admin' : '/';
        return response()->json(['message' => 'Đăng nhập thành công', 'token' => $token, 'redirect_url' => $redirectUrl, 'role' => $user->role]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        if ($user) {
            // Xóa tất cả token của user
            $user->tokens()->delete();
        }

        return response()->json(['message' => 'Đăng xuất thành công'], 200);
    }
}
