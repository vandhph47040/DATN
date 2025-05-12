<?php




namespace App\Http\Controllers\API;




use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\CalendarShow;
use App\Models\Combo;
use App\Models\DiscountCode;
use App\Models\Seat;
use App\Models\SeatTypePrice;
use App\Models\ShowTime;
use App\Models\ShowTimeDate;
use App\Services\PayPalService;
use App\Services\UserRankService;
use App\Services\ZaloPayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Str;




class PaymentController extends Controller
{




    private $userRankService;
    protected $paypalService;




    public function __construct(UserRankService $userRankService, PayPalService $paypalService)
    {
        $this->userRankService = $userRankService;
        $this->paypalService = $paypalService;
    }




    public function createVNPay(Request $request)
    {
        // Đảm bảo người dùng đã đăng nhập
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }


        // Validation: Nhận tất cả dữ liệu từ request
        $request->validate([
            'totalPrice' => 'required|numeric|min:0',
            'total_combo_price' => 'required|numeric|min:0',
            'total_ticket_price' => 'required|numeric|min:0',
            'total_price_point' => 'nullable|numeric|min:0',
            'total_price_voucher' => 'nullable|numeric|min:0',
            'movie_id' => 'required|exists:movies,id',
            'showtime_id' => 'required|exists:show_times,id',
            'calendar_show_id' => 'required|exists:calendar_show,id',
            'seat_ids' => 'required|array',
            'seat_ids.*' => 'exists:seats,id',
            'combo_ids' => 'nullable|array',
            'combo_ids.*' => 'exists:combos,id',
            'usedPoints' => 'nullable|integer|min:0',
            'discount_code' => 'nullable|string',
        ]);


        $bookingData = $request->all();
        $bookingData['payment_method'] = 'VNpay';
        $bookingData['user_id'] = auth()->id();


        Log::info('Booking Data request: ', $bookingData);


        // Kiểm tra usedPoints
        $usedPoints = $request->input('usedPoints', 0);
        $userData = $this->userRankService->getRankAndPoints(auth()->id());
        if ($usedPoints > $userData['points']) {
            return response()->json(['message' => 'Số điểm sử dụng vượt quá điểm tích lũy'], 400);
        }


        // Kiểm tra số lượng combo
        if (!empty($request->combo_ids)) {
            $comboQuantities = collect($request->combo_ids)->groupBy(fn($id) => $id);
            $combos = Combo::whereIn('id', $comboQuantities->keys())->get();


            foreach ($combos as $combo) {
                $quantity = $comboQuantities[$combo->id]->count();


                if (!isset($combo->quantity)) {
                    Log::warning("Combo ID {$combo->id} does not have a quantity column.");
                    continue;
                }


                if ($combo->quantity < $quantity) {
                    return response()->json([
                        'success' => false,
                        'message' => "Combo {$combo->name} không đủ số lượng. Yêu cầu: $quantity, Còn lại: {$combo->quantity}",
                        'redirect' => 'http://localhost:5173/booking/payment-result?status=failure&message=' . urlencode("Combo {$combo->name} không đủ số lượng. Yêu cầu: $quantity, Còn lại: {$combo->quantity}"),
                    ], 400);
                }
            }
        }


        // Xử lý mã khuyến mại
        $discountCode = $request->input('discount_code');
        $discountCodeId = null;


        if ($discountCode) {
            $discount = DiscountCode::where('name_code', $discountCode)
                ->where('status', 'active')
                ->where('quantity', '>', 0)
                ->where('start_date', '<=', now())
                ->where('end_date', '>=', now())
                ->first();


            if (!$discount) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mã khuyến mại đã được dùng hết',
                    'redirect' => 'http://localhost:5173/booking/payment-result?status=failure&message=' . urlencode('Mã khuyến mại không hợp lệ hoặc đã hết hạn'),
                ], 400);
            }


            if ($discount->quantity < 1) {
                return response()->json([
                    'success' => false,
                    'message' => "Mã khuyến mại {$discount->name_code} đã hết số lượng",
                    'redirect' => 'http://localhost:5173/booking/payment-result?status=failure&message=' . urlencode("Mã khuyến mại {$discount->name_code} đã hết số lượng"),
                ], 400);
            }


            $discountCodeId = $discount->id;
            // Chưa trừ quantity ở đây, sẽ trừ sau khi thanh toán thành công
        }


        // Lấy dữ liệu pricing từ request (không tính lại)
        $pricing = [
            'total_ticket_price' => $request->total_ticket_price,
            'total_combo_price' => $request->total_combo_price,
            'total_price_before_discount' => $request->total_ticket_price + $request->total_combo_price,
            'total_price_point' => $request->total_price_point,
            'total_price_voucher' => $request->total_price_voucher,
            'point_discount' => $usedPoints * 1000,
            'discount_code_id' => $discountCodeId,
            'discount_code' => $discountCode,
            'total_price' => $request->totalPrice,
            'used_points' => $usedPoints,
        ];


        // Ghi dữ liệu giá vào bookingData
        $bookingData['pricing'] = $pricing;
        Log::info('Booking Data: ', $bookingData);


        $vnp_TxnRef = time() . "";
        $bookingData['unique_token'] = Str::random(32); // Thêm token duy nhất
        Redis::setex("booking:$vnp_TxnRef", 3600, json_encode($bookingData));




        $vnp_Url = env('VNP_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html');
        $vnp_Returnurl = env('VNP_RETURN_URL', 'http://localhost:8000/api/VNPay/return');
        $vnp_TmnCode = env('VNP_TMN_CODE', 'GXTS9J8E');
        $vnp_HashSecret = env('VNP_HASH_SECRET', 'Y7EVYR6BH7GXOWUSYIFLWW9JHZV5DK7E');


        $vnp_OrderInfo = 'Thanh toán vé xem phim';
        $vnp_OrderType = '0';
        $vnp_Amount = $request->input('totalPrice') * 100;
        $vnp_Locale = 'vn';
        $vnp_BankCode = 'NCB';
        $vnp_IpAddr = $request->ip();


        $inputData = array(
            "vnp_Version" => "2.1.0",
            "vnp_TmnCode" => $vnp_TmnCode,
            "vnp_Amount" => $vnp_Amount,
            "vnp_Command" => "pay",
            "vnp_CreateDate" => date('YmdHis'),
            "vnp_CurrCode" => "VND",
            "vnp_IpAddr" => $vnp_IpAddr,
            "vnp_Locale" => $vnp_Locale,
            "vnp_OrderInfo" => $vnp_OrderInfo,
            "vnp_OrderType" => $vnp_OrderType,
            "vnp_ReturnUrl" => $vnp_Returnurl,
            "vnp_TxnRef" => $vnp_TxnRef,
        );


        ksort($inputData);
        $query = http_build_query($inputData);
        $hashdata = $query;
        $vnp_SecureHash = hash_hmac('sha512', $hashdata, $vnp_HashSecret);
        $vnp_Url .= "?" . $query . "&vnp_SecureHash=" . $vnp_SecureHash;


        Log::info('Input Data: ', $inputData);
        return response()->json(['code' => '00', 'message' => 'thanh toán thành công', 'data' => $vnp_Url]);
    }




    public function VNPayReturn(Request $request)
    {
        Log::info('VNPay Return Request: ' . json_encode($request->all()));
        $vnp_HashSecret = env('VNP_HASH_SECRET', 'Y7EVYR6BH7GXOWUSYIFLWW9JHZV5DK7E');
        $vnp_SecureHash = $request->vnp_SecureHash;
        $inputData = $request->except('vnp_SecureHash');


        ksort($inputData);
        $hashData = http_build_query($inputData);
        $secureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);


        if ($secureHash === $vnp_SecureHash && $request->vnp_ResponseCode == '00') {
            $bookingData = json_decode(Redis::get("booking:$request->vnp_TxnRef"), true);


            if (!$bookingData) {
                Log::error('Booking data not found for TxnRef: ' . $request->vnp_TxnRef);
                return redirect()->away('http://localhost:5173/booking/payment-result?status=failure&message=' . urlencode('Không tìm thấy dữ liệu đặt vé'));
            }


            // Kiểm tra xem token đã được xử lý chưa
            $processedKey = "processed_booking:{$bookingData['unique_token']}";
            if (Redis::exists($processedKey)) {
                return redirect()->away('http://localhost:5173/booking/payment-result?status=failure&message=' . urlencode('Đơn hàng đã được xử lý trước đó'));
            }


            $bookingData['is_payment_completed'] = true;
            Log::info('Merged Booking Data: ' . json_encode($bookingData));


            $ticketController = new TicketController(app(UserRankService::class));
            $response = $ticketController->getTicketDetails(new Request($bookingData));


            // Kiểm tra JSON response từ getTicketDetails()
            $data = $response->getData(true); // Lấy dữ liệu dưới dạng mảng
            if ($data['success'] === false) {
                // Nếu có lỗi (ví dụ: combo hoặc discount code không đủ số lượng), redirect theo URL trong response
                return redirect()->away($data['redirect']);
            }


            Redis::setex($processedKey, 3600, 'processed');
            Redis::del("booking:$request->vnp_TxnRef");


            // Trừ điểm nếu sử dụng
            $usedPoints = $bookingData['pricing']['used_points'] ?? 0;
            if ($usedPoints > 0) {
                $success = $this->userRankService->deductPoints($bookingData['user_id'], $usedPoints);
                if (!$success) {
                    Log::warning("Không thể trừ $usedPoints điểm cho user_id = {$bookingData['user_id']}");
                }
            }


            Redis::del("booking:$request->vnp_TxnRef");


            // Khi thanh toán thành công
            $bookingId = $data['booking_id'] ?? null;
            if (!$bookingId) {
                Log::error('Booking ID not found in response', ['response' => $data]);
                return redirect()->away('http://localhost:5173/booking/payment-result?status=failure&message=' . urlencode('Không tìm thấy booking ID'));
            }


            return redirect()->away("http://localhost:5173/booking/{$bookingId}/payment-result?status=success");
        } else {
            return redirect()->away('http://localhost:5173/booking/payment-result?status=failure&message=' . urlencode('Thanh toán thất bại'));
        }
    }




    public function holdSeats(Request $request)
    {
        $request->validate([
            'showtime_id' => 'required|exists:show_times,id',
            'seat_ids' => 'required|array',
            'seat_ids.*' => 'exists:seats,id',
        ]);




        $userId = auth()->id();
        if (!$userId) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }




        foreach ($request->seat_ids as $seatId) {
            $cacheKey = "seat_{$request->showtime_id}_{$seatId}";
            Cache::put($cacheKey, ['user_id' => $userId, 'expires_at' => now()->addMinutes(15)], 15); // Giữ 15 phút
        }




        $roomId = ShowTime::find($request->showtime_id)->room_id;
        $seatingMatrix = app(TicketController::class)->getSeatingMatrix($roomId, $request->showtime_id);
        broadcast(new \App\Events\SeatUpdated($roomId, $request->showtime_id, $seatingMatrix))->toOthers();




        return response()->json(['success' => true]);
    }


    //PayPal
    public function createPaypal(Request $request)
    {
        // Đảm bảo người dùng đã đăng nhập
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }


        // Validation: Nhận tất cả dữ liệu từ request
        $request->validate([
            'totalPrice' => 'required|numeric|min:0',
            'total_combo_price' => 'required|numeric|min:0',
            'total_ticket_price' => 'required|numeric|min:0',
            'total_price_point' => 'nullable|numeric|min:0',
            'total_price_voucher' => 'nullable|numeric|min:0',
            'movie_id' => 'required|exists:movies,id',
            'showtime_id' => 'required|exists:show_times,id',
            'calendar_show_id' => 'required|exists:calendar_show,id',
            'seat_ids' => 'required|array',
            'seat_ids.*' => 'exists:seats,id',
            'combo_ids' => 'nullable|array',
            'combo_ids.*' => 'exists:combos,id',
            'usedPoints' => 'nullable|integer|min:0',
            'discount_code' => 'nullable|string',
        ]);


        $bookingData = $request->all();
        $bookingData['payment_method'] = "PayPal";
        $bookingData['user_id'] = auth()->id();
        $bookingData['unique_token'] = Str::random(32);


        Log::info('Booking Data request: ', $bookingData);


        // Kiểm tra usedPoints
        $usedPoints = $request->input('usedPoints', 0);
        $userData = $this->userRankService->getRankAndPoints(auth()->id());
        if ($usedPoints > $userData['points']) {
            return response()->json(['message' => 'Số điểm sử dụng vượt quá điểm tích lũy'], 400);
        }


        // Kiểm tra số lượng combo
        if (!empty($request->combo_ids)) {
            $comboQuantities = collect($request->combo_ids)->groupBy(fn($id) => $id);
            $combos = Combo::whereIn('id', $comboQuantities->keys())->get();


            foreach ($combos as $combo) {
                $quantity = $comboQuantities[$combo->id]->count();


                if (!isset($combo->quantity)) {
                    Log::warning("Combo ID {$combo->id} does not have a quantity column.");
                    continue;
                }


                if ($combo->quantity < $quantity) {
                    return response()->json([
                        'success' => false,
                        'message' => "Combo {$combo->name} không đủ số lượng. Yêu cầu: $quantity, Còn lại: {$combo->quantity}",
                        'redirect' => 'http://localhost:5173/booking/payment-result?status=failure&message=' . urlencode("Combo {$combo->name} không đủ số lượng. Yêu cầu: $quantity, Còn lại: {$combo->quantity}"),
                    ], 400);
                }
            }
        }


        // Xử lý mã khuyến mại
        $discountCode = $request->input('discount_code');
        $discountCodeId = null;


        if ($discountCode) {
            $discount = DiscountCode::where('name_code', $discountCode)
                ->where('status', 'active')
                ->where('quantity', '>', 0)
                ->where('start_date', '<=', now())
                ->where('end_date', '>=', now())
                ->first();


            if (!$discount) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mã khuyến mại không hợp lệ hoặc đã hết hạn',
                    'redirect' => 'http://localhost:5173/booking/payment-result?status=failure&message=' . urlencode('Mã khuyến mại không hợp lệ hoặc đã hết hạn'),
                ], 400);
            }


            if ($discount->quantity < 1) {
                return response()->json([
                    'success' => false,
                    'message' => "Mã khuyến mại {$discount->name_code} đã hết số lượng",
                    'redirect' => 'http://localhost:5173/booking/payment-result?status=failure&message=' . urlencode("Mã khuyến mại {$discount->name_code} đã hết số lượng"),
                ], 400);
            }


            $discountCodeId = $discount->id;
            // Chưa trừ quantity ở đây, sẽ trừ sau khi thanh toán thành công
        }


        // Lấy dữ liệu pricing từ request (không tính lại)
        $pricing = [
            'total_ticket_price' => $request->total_ticket_price,
            'total_combo_price' => $request->total_combo_price,
            'total_price_before_discount' => $request->total_ticket_price + $request->total_combo_price,
            'total_price_point' => $request->total_price_point,
            'total_price_voucher' => $request->total_price_voucher,
            'point_discount' => $usedPoints * 1000,
            'discount_code_id' => $discountCodeId,
            'discount_code' => $discountCode,
            'total_price' => $request->totalPrice,
            'used_points' => $usedPoints,
        ];


        // Ghi dữ liệu giá vào bookingData
        $bookingData['pricing'] = $pricing;
        Log::info('Booking Data: ', $bookingData);


        // Tạo transaction reference giống VNPay
        $paypalTxnRef = time() . "";
        Redis::setex("booking:paypal:$paypalTxnRef", 3600, json_encode($bookingData));


        // Convert từ VND sang USD (giá để gọi PayPal)
        $usdRate = 25000;
        $priceInUSD = round($request->totalPrice / $usdRate, 2);


        // Chuẩn bị thông tin thanh toán PayPal
        try {
            $result = $this->paypalService->createPayment(
                $priceInUSD,
                'USD',
                'Thanh toán vé xem phim',
                route('paypal.return') . "?txn_ref=$paypalTxnRef",
                route('paypal.cancel') . "?txn_ref=$paypalTxnRef"
            );




            if ($result['status'] === 'success') {
                Log::info('PayPal payment created successfully', ['payment_id' => $result['payment_id']]);
                return response()->json([
                    'code' => '00',
                    'message' => 'Thanh toán thành công',
                    'data' => $result['approval_url']
                ]);
            } else {
                Log::error('Failed to create PayPal payment', $result);
                return response()->json([
                    'code' => '01',
                    'message' => 'Không thể tạo giao dịch PayPal',
                    'redirect' => 'http://localhost:5173/booking/payment-result?status=failure&message=' . urlencode('Không thể tạo giao dịch PayPal')
                ], 400);
            }
        } catch (\Exception $e) {
            Log::error('PayPal payment exception: ' . $e->getMessage());
            return response()->json([
                'code' => '01',
                'message' => 'Lỗi khi xử lý thanh toán PayPal',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    // Method to handle PayPal return URL
    public function paypalReturn(Request $request)
    {
        Log::info('PayPal Return Request: ' . json_encode($request->all()));


        // Lấy transaction reference
        $txnRef = $request->txn_ref;
        if (!$txnRef) {
            Log::error('Missing transaction reference in PayPal return');
            return redirect()->away('http://localhost:5173/booking/payment-result?status=failure&message=' . urlencode('Thiếu thông tin giao dịch'));
        }


        // Kiểm tra và xử lý thanh toán PayPal
        $paymentId = $request->paymentId;
        $payerId = $request->PayerID;


        if (!$paymentId || !$payerId) {
            Log::error('Missing payment ID or payer ID', ['paymentId' => $paymentId, 'payerId' => $payerId]);
            return redirect()->away('http://localhost:5173/booking/payment-result?status=failure&message=' . urlencode('Thiếu thông tin thanh toán PayPal'));
        }


        // Lấy dữ liệu booking từ Redis
        $bookingData = json_decode(Redis::get("booking:paypal:$txnRef"), true);
        if (!$bookingData) {
            Log::error('Booking data not found for TxnRef: ' . $txnRef);
            return redirect()->away('http://localhost:5173/booking/payment-result?status=failure&message=' . urlencode('Không tìm thấy dữ liệu đặt vé'));
        }


        // Kiểm tra xem token đã được xử lý chưa
        $processedKey = "processed_booking:{$bookingData['unique_token']}";
        if (Redis::exists($processedKey)) {
            return redirect()->away('http://localhost:5173/booking/payment-result?status=failure&message=' . urlencode('Đơn hàng đã được xử lý trước đó'));
        }


        // Thực hiện thanh toán PayPal
        try {
            $result = $this->paypalService->executePayment($paymentId, $payerId);


            if ($result['status'] !== 'success') {
                Log::error('Failed to execute PayPal payment', $result);
                return redirect()->away('http://localhost:5173/booking/payment-result?status=failure&message=' . urlencode('Thanh toán PayPal thất bại'));
            }


            // Đánh dấu thanh toán đã hoàn thành
            $bookingData['is_payment_completed'] = true;
            Log::info('Booking payment completed: ', $bookingData);


            // Xử lý tạo vé giống như VNPay
            $ticketController = new TicketController(app(UserRankService::class));
            $response = $ticketController->getTicketDetails(new Request($bookingData));


            // Kiểm tra JSON response từ getTicketDetails()
            $data = $response->getData(true);
            Log::info('Response from getTicketDetails:', $data);
            if (!isset($data['success']) || $data['success'] === false) {
                return redirect()->away($data['redirect'] ?? 'http://localhost:5173/booking/payment-result?status=failure&message=' . urlencode('Có lỗi xảy ra trong quá trình xử lý thanh toán'));
            }




            // Đánh dấu đã xử lý để tránh trùng lặp
            Redis::setex($processedKey, 3600, 'processed');
            Redis::del("booking:paypal:$txnRef");


            // Trừ điểm nếu sử dụng
            $usedPoints = $bookingData['pricing']['used_points'] ?? 0;
            if ($usedPoints > 0) {
                $success = $this->userRankService->deductPoints($bookingData['user_id'], $usedPoints);
                if (!$success) {
                    Log::warning("Không thể trừ $usedPoints điểm cho user_id = {$bookingData['user_id']}");
                }
            }


            // Xử lý mã giảm giá nếu có
            if (!empty($bookingData['pricing']['discount_code_id'])) {
                $discountCode = DiscountCode::find($bookingData['pricing']['discount_code_id']);
                if ($discountCode) {
                    $discountCode->decrement('quantity');
                    Log::info("Đã giảm số lượng mã giảm giá {$discountCode->name_code}");
                }
            }


            // Khi thanh toán thành công, chuyển hướng tới trang kết quả
            $bookingId = $data['booking_id'] ?? null;
            if (!$bookingId) {
                Log::error('Booking ID not found in response', ['response' => $data]);
                return redirect()->away('http://localhost:5173/booking/payment-result?status=failure&message=' . urlencode('Không tìm thấy booking ID'));
            }


            return redirect()->away("http://localhost:5173/booking/{$bookingId}/payment-result?status=success");
        } catch (\Exception $e) {
            Log::error('PayPal execute payment exception: ' . $e->getMessage());
            return redirect()->away('http://localhost:5173/booking/payment-result?status=failure&message=' . urlencode('Lỗi xử lý thanh toán: ' . $e->getMessage()));
        }
    }


    // Method to handle PayPal cancel URL
    public function paypalCancel(Request $request)
    {
        Log::info('PayPal Cancel Request: ' . json_encode($request->all()));


        $txnRef = $request->txn_ref;
        if ($txnRef) {
            Redis::del("booking:paypal:$txnRef");
        }


        return redirect()->away('http://localhost:5173/booking/payment-result?status=cancelled&message=' . urlencode('Bạn đã hủy thanh toán'));
    }
}



