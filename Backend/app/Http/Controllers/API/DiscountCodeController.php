<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\DiscountCode;
use App\Models\Seat;
use App\Models\ShowTime;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class DiscountCodeController extends Controller
{
    /**
     * Kiểm tra xem có ghế nào đang được giữ trong cache hay không
     */
    private function hasSeatsInCache()
    {
        // Lấy tất cả showTimeIds
        $showTimeIds = ShowTime::pluck('id');

        // Lấy tất cả seatIds
        $seatIds = Seat::pluck('id');

        // Kiểm tra từng showTimeId và seatId trong cache
        foreach ($showTimeIds as $showTimeId) {
            foreach ($seatIds as $seatId) {
                $cacheKey = "seat_{$showTimeId}_{$seatId}";
                if (Cache::has($cacheKey)) {
                    return true; // Có ít nhất một ghế đang được giữ trong cache
                }
            }
        }

        return false; // Không có ghế nào đang được giữ trong cache
    }

    public function applyDiscountCode(Request $request)
    {
        $request->validate([
            'name_code' => 'required|string',
        ]);

        // Lấy thông tin mã giảm giá
        $DiscountCode = DiscountCode::where('name_code', trim($request->name_code))
            ->where('status', 'active')
            ->where('start_date', '<=', Carbon::now())
            ->where('end_date', '>=', Carbon::now())
            ->first();

        // Kiểm tra mã giảm giá có tồn tại và hợp lệ
        if (!$DiscountCode) {
            return response()->json([
                'success' => false,
                'message' => 'Mã khuyến mãi không hợp lệ hoặc đã hết hạn.',
            ], 404);
        }

        // Kiểm tra số lượng mã giảm giá
        if ($DiscountCode->quantity <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Rất tiếc, mã khuyến mãi này đã hết.',
            ], 404);
        }

        // Kiểm tra nếu mã giảm giá là private
        if ($DiscountCode->type === 'private') {
            // Lấy user_id của người dùng đang đăng nhập
            $userId = auth()->id();

            // Nếu không có user_id (người dùng chưa đăng nhập)
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn cần đăng nhập để sử dụng mã giảm giá này.',
                ], 401);
            }

            // Kiểm tra xem user_id có trong danh sách người dùng được phép
            if (!$DiscountCode->users()->where('user_id', $userId)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mã giảm giá này không dành cho bạn.',
                ], 403);
            }
        }

        // Áp dụng mã giảm giá thành công
        $response = [
            'success' => true,
            'discount_percent' => (int) $DiscountCode->percent,
            'maxPrice' => (int) ($DiscountCode->maxPrice ?? 0),
            'message' => 'Áp dụng mã khuyến mãi thành công!',
        ];

        // Nếu mã là private, xóa cặp discount_code_id và user_id khỏi bảng trung gian
        if ($DiscountCode->type === 'private') {
            try {
                $DiscountCode->users()->detach($userId);
            } catch (\Exception $e) {
                // Ghi log lỗi nếu cần, nhưng không làm gián đoạn response thành công
                Log::error('Failed to detach user from discount code:', [
                    'discount_code_id' => $DiscountCode->id,
                    'user_id' => $userId,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return response()->json($response);
    }

    // Lấy danh sách mã giảm giá của người dùng
    public function getUserDiscountCodes(Request $request)
    {
        // Lấy user_id của người dùng đang đăng nhập
        $userId = auth()->id();

        // Kiểm tra nếu người dùng chưa đăng nhập
        if (!$userId) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn cần đăng nhập để xem danh sách mã giảm giá.',
                'data' => []
            ], 401);
        }

        // Lấy danh sách mã giảm giá của user_id
        $discountCodes = DiscountCode::whereHas('users', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
            ->where('status', 'active')
            ->where('quantity', '>', 0)
            ->where('start_date', '<=', Carbon::now())
            ->where('end_date', '>=', Carbon::now())
            ->get(['id', 'name_code', 'percent', 'maxPrice', 'start_date', 'end_date', 'type']);

        if ($discountCodes->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy mã giảm giá nào dành cho bạn.',
                'data' => []
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách mã giảm giá của bạn thành công.',
            'data' => $discountCodes
        ], 200);
    }

    // Gán một user_id cho discount_code_id
    public function assignUserToDiscountCode(Request $request)
    {
        // Validate dữ liệu đầu vào
        // $validator = Validator::make($request->all(), [
        //     'discount_code_id' => 'required|numeric|exists:discount_code,id',
        //     'user_id' => 'required|numeric|exists:users,id'
        // ]);

        // if ($validator->fails()) {
        //     return response()->json([
        //         'success' => false,
        //         'message' => 'Dữ liệu đầu vào không hợp lệ.',
        //         'errors' => $validator->errors()
        //     ], 422);
        // }

        try {
            $data = $request->all();
            $discountCodeId = $data['discount_code_id'];
            $userId = $data['user_id'];

            // Tìm mã giảm giá
            $discountCode = DiscountCode::find($discountCodeId);
            if (!$discountCode) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mã giảm giá không tồn tại.'
                ], 404);
            }

            // Kiểm tra xem user_id đã được gán cho mã giảm giá chưa
            if ($discountCode->users()->where('user_id', $userId)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn đã quay trúng mã giảm giá này.'
                ], 409);
            }

            // Gán user_id cho mã giảm giá
            $discountCode->users()->attach($userId);

            return response()->json([
                'success' => true,
                'message' => 'Gán người dùng cho mã giảm giá thành công.',
                'data' => $data,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi trong quá trình xử lý.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $DiscountCodes = DiscountCode::query()->latest('id')->get();

        return response()->json($DiscountCodes, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate dữ liệu
        $validator = Validator::make($request->all(), [
            'name_code' => 'required|string|max:255|unique:discount_code,name_code',
            'type' => 'nullable|in:public,private',
            'percent' => 'required|integer|max:100',
            'quantity' => 'required|integer|min:1',
            'status' => 'required|in:active,inactive',
            'maxPrice' => 'required|numeric|min:0',
            'start_date' => [
                'required',
                'date_format:Y-m-d',
                function ($attribute, $value, $fail) use ($request) {
                    if (strtotime($value) >= strtotime($request->input('end_date'))) {
                        $fail('Ngày bắt đầu phải nhỏ hơn ngày kết thúc.');
                    }
                },
            ],
            'end_date' => 'required|date_format:Y-m-d',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Lấy dữ liệu mã khuyến mãi
        $data = $request->all();

        // Thêm mã khuyến mãi mới
        $DiscountCode = DiscountCode::query()->create($data);

        return response()->json([
            'message' => 'Thêm mã khuyến mãi thành công',
            'data' => $DiscountCode
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //Tìm mã khuyến mãi theo id
        $DiscountCode = DiscountCode::find($id);

        if (!$DiscountCode) {
            return response()->json(['message' => 'không tìm thấy mã khuyến mãi'], 404);
        }

        return response()->json($DiscountCode, 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // Tìm mã khuyến mãi theo id
        $DiscountCode = DiscountCode::find($id);

        if (!$DiscountCode) {
            return response()->json(['message' => 'Không tìm thấy mã khuyến mãi'], 404);
        }

        // Kiểm tra xem có ghế nào đang được giữ trong cache không
        if ($this->hasSeatsInCache()) {
            return response()->json([
                'message' => 'Có người đang dùng mã khuyến mãi này, không thể cập nhật!'
            ], 409);
        }

        // Validate dữ liệu
        $validator = Validator::make($request->all(), [
            'name_code' => 'required|string|max:255|unique:discount_code,name_code,' . $id,
            'type' => 'nullable|in:public,private',
            'percent' => 'required|integer|max:100',
            'quantity' => 'required|integer|min:1',
            'status' => 'required|in:active,inactive',
            'maxPrice' => 'required|numeric|min:0',
            'start_date' => [
                'required',
                'date_format:Y-m-d',
                function ($attribute, $value, $fail) use ($request) {
                    if (strtotime($value) >= strtotime($request->input('end_date'))) {
                        $fail('Ngày bắt đầu phải nhỏ hơn ngày kết thúc.');
                    }
                },
            ],
            'end_date' => 'required|date_format:Y-m-d',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Lấy dữ liệu mã khuyến mãi
        $data = $request->all();

        // Cập nhật mã khuyến mãi
        $DiscountCode->update($data);

        return response()->json([
            'message' => 'Cập nhật mã khuyến mãi thành công',
            'data' => $DiscountCode
        ], 201);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //Tìm mã khuyến mãi theo id
        $DiscountCode = DiscountCode::find($id);

        if (!$DiscountCode) {
            return response()->json(['message' => 'không tìm thấy mã khuyến mãi'], 404);
        }

        // Kiểm tra xem có ghế nào đang được giữ trong cache không
        if ($this->hasSeatsInCache()) {
            return response()->json([
                'message' => 'Có người đang dùng mã khuyến mãi này, không thể xóa!'
            ], 409);
        }

        //Xóa mã khuyến mãi
        $DiscountCode->delete();

        return response()->json(['message' => 'Xóa mã khuyến mãi thành công'], 200);
    }
}
