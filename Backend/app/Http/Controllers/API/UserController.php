<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\UserRankService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    private $userRankService;

    public function __construct(UserRankService $userRankService)
    {
        $this->userRankService = $userRankService;
    }

    public function index()
    {

        //Danh sách người dùng
        $users = User::query()->latest('id')->get();

        //Danh sách người dùng bị khóa
        $trashedUsers = User::onlyTrashed()->get();

        return response()->json([
            'users' => $users,
            'trashedUsers' => $trashedUsers,
        ], 200);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {

        // Tìm người dùng theo id
        $user = User::find($id);

        // Nếu không tìm thấy người dùng
        if (!$user) {
            return response()->json(['message' => 'Người dùng không tồn tại'], 404);
        }

        return response()->json($user, 200);
    }

    public function showUserDestroy(string $id)
    {


        //Tìm người dùng theo id
        $user = User::onlyTrashed()->find($id);

        //nếu không tìm thấy trả về 404
        if (!$user) {
            return response()->json([
                'message' => 'Không tìm thấy người dùng này',
            ], 404);
        }

        //trả về chi tiết người dùng
        return response()->json([
            'message' => 'Thông tin chi tiết người dùng',
            'data' => $user
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {

        // Tìm người dùng theo id
        $user = User::find($id);

        // Nếu không tìm thấy người dùng
        if (!$user) {
            return response()->json(['message' => 'người dùng không tồn tại'], 404);
        }

        // Validate dữ liệu
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|max:255',
            'phone' => [
                'nullable',
                'numeric',
                'digits_between:10,15',
                Rule::unique('users', 'phone')->ignore($user->id),
            ],
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        //Lấy dữ liệu người dùng
        $data = $request->all();

        // Cập nhật người dùng
        $user->update($data);

        return response()->json(['message' => 'Cập nhật người dùng thành công', 'data' => $user], 200);
    }

    /**
     * Xóa mềm người dùng (đổi qua trạng thái tài khoản bị khóa)
     */
    public function destroy($id)
    {


        try {
            // Tìm người dùng theo ID
            $user = User::findOrFail($id);

            // khóa người dùng
            $user->delete();

            // Trả về phản hồi thành công
            return response()->json(['message' => 'Khóa tài khoản người dùng thành công'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi khi khóa người dùng: ' . $e->getMessage()], 500);
        }
    }

    public function restore($id)
    {


        $user = User::onlyTrashed()->find($id);

        if (!$user) {
            return response()->json(['message' => 'Không tìm thấy người dùng bị khóa'], 404);
        }

        $user->restore(); // Khôi phục người dùng

        return response()->json(['message' => 'Khôi phục lại người dùng thành công'], 200);
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user(); // Lấy thông tin người dùng hiện tại

        // Kiểm tra nếu chưa đăng nhập
        if (!$user) {
            return response()->json(['error' => 'Bạn chưa đăng nhập!'], 401);
        }

        // Validate dữ liệu
        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'email' => ['nullable', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => [
                'nullable',
                'numeric',
                'digits_between:10,15',
                Rule::unique('users', 'phone')->ignore($user->id),
            ],
            'date_of_birth' => 'nullable|date_format:Y-m-d|before:today',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Lấy dữ liệu cần cập nhật
        $data = $request->only(['name', 'email', 'phone', 'date_of_birth']);

        // Cập nhật thông tin người dùng
        $user->update($data);

        return response()->json([
            'message' => 'Thông tin tài khoản đã được cập nhật thành công!',
            'user' => $user
        ], 200);
    }

    /**
     * Đổi mật khẩu người dùng
     */
    public function changePassword(Request $request)
    {
        $user = Auth::user(); // Lấy thông tin người dùng hiện tại

        // Kiểm tra nếu chưa đăng nhập
        if (!$user) {
            return response()->json(['error' => 'Bạn chưa đăng nhập!'], 401);
        }

        // Xóa dấu cách trong mật khẩu trước khi validate
        $passwordWithoutSpaces = preg_replace('/\s+/', '', $request->input('password'));
        $oldPasswordWithoutSpaces = preg_replace('/\s+/', '', $request->input('oldPassword'));

        // Thay thế giá trị trong request để validate
        $request->merge([
            'password' => $passwordWithoutSpaces,
            'oldPassword' => $oldPasswordWithoutSpaces,
            'password_confirmation' => preg_replace('/\s+/', '', $request->input('password_confirmation')),
        ]);

        // Validate dữ liệu
        $validator = Validator::make($request->all(), [
            'oldPassword' => 'required|string',
            'password' => [
                'required',
                'string',
                'confirmed',
                'min:6',
                'max:12',
                'regex:/^(?=.*[A-Z])(?=.*[a-zA-Z])(?=.*\d).{6,12}$/', // Ít nhất 1 chữ in hoa, có cả chữ và số
                'different:email', // Không trùng với email
                function ($attribute, $value, $fail) use ($user) {
                    // Kiểm tra xem password có trùng với mật khẩu cũ không
                    if (Hash::check($value, $user->password)) {
                        $fail('Mật khẩu mới không được trùng với mật khẩu cũ.');
                    }
                },
            ],
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Kiểm tra mật khẩu hiện tại có đúng không
        if (!Hash::check($request->oldPassword, $user->password)) {
            return response()->json(['error' => 'Mật khẩu hiện tại không đúng'], 401);
        }

        // Cập nhật mật khẩu mới (đã xóa dấu cách)
        $user->update([
            'password' => Hash::make($request->password)
        ]);

        return response()->json([
            'message' => 'Đổi mật khẩu thành công!'
        ], 200);
    }

    /**
     * Lấy thông tin hạng và điểm của người dùng
     */
    public function getUserRankAndPoints(Request $request)
    {
        $userId = $request->user_id ?? Auth::id();
        if (!$userId) {
            return response()->json(['message' => 'Vui lòng cung cấp user_id hoặc đăng nhập'], 401);
        }

        $userData = $this->userRankService->getRankAndPoints($userId);
        if ($userData === false) {
            return response()->json(['message' => 'Không tìm thấy người dùng'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $userData,
        ], 200);
    }

    /**
     * Tìm kiếm người dùng theo email
     */
    public function searchByEmail(Request $request)
    {
        // Validate dữ liệu đầu vào
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Tìm kiếm người dùng theo email
        $users = User::where('email', $request->email)->get();

        if ($users->isEmpty()) {
            return response()->json(['message' => 'Không tìm thấy người dùng với email này'], 404);
        }

        return response()->json([
            'message' => 'Kết quả tìm kiếm theo email',
            'data' => $users
        ], 200);
    }

    /**
     * Tìm kiếm người dùng theo tên
     */
    public function searchByName(Request $request)
    {
        // Validate dữ liệu đầu vào
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Tìm kiếm người dùng có tên chứa chuỗi đầu vào (không phân biệt hoa thường)
        $users = User::where('name', 'LIKE', '%' . $request->name . '%')->get();

        if ($users->isEmpty()) {
            return response()->json(['message' => 'Không tìm thấy người dùng với tên này'], 404);
        }

        return response()->json([
            'message' => 'Kết quả tìm kiếm theo tên',
            'data' => $users
        ], 200);
    }
}
