<?php




namespace App\Http\Controllers\API;


use App\Events\SeatHeldEvent;
use App\Events\SeatUpdated;
use App\Http\Controllers\Controller;
use App\Mail\BookingConfirmation;
use App\Models\RoomType;
use App\Models\SeatTypePrice;
use App\Models\ShowTimeDate;
use App\Models\ShowTimeSeat;
use App\Services\UserRankService;
use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\BookingDetail;
use App\Models\Seat;
use App\Models\Combo;
use App\Models\ShowTime;
use App\Models\CalendarShow;
use App\Models\DiscountCode;
use App\Models\Movies;
use App\Models\Room;
use App\Models\SeatType;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;




class TicketController extends Controller
{
    private $userRankService;


    public function __construct(UserRankService $userRankService)
    {
        $this->userRankService = $userRankService;
    }


    public function index()
    {
        $ticketPrices = SeatTypePrice::with([
            'seatType',
            'seatType.seat',
            'seatType.seat.room',
            'seatType.seat.room.roomType'
        ])->get();


        $groupedBySeatType = $ticketPrices->groupBy('seat_type_id');


        $data = [];
        $counter = 1; // Biến đếm để tạo id duy nhất
        foreach ($groupedBySeatType as $seatTypeId => $group) {
            $seatType = $group->first()->seatType;
            $seatTypeName = $seatType ? $seatType->name : 'Không xác định';


            $roomData = $seatType->seat
                ->map(function ($seat) {
                    if ($seat->room && $seat->room->roomType) {
                        return [
                            'room_name' => $seat->room->name,
                            'room_type' => $seat->room->roomType
                        ];
                    }
                    return null;
                })
                ->filter()
                ->unique(function ($item) {
                    return $item['room_type']->id . '|' . $item['room_name'];
                })
                ->values();


            if ($roomData->isEmpty()) {
                $roomData = collect([['room_name' => 'Không xác định', 'room_type' => null]]);
            }


            foreach ($roomData as $roomItem) {
                $roomTypeName = $roomItem['room_type'] ? $roomItem['room_type']->name : 'Không xác định';
                $roomTypePrice = $roomItem['room_type'] ? $roomItem['room_type']->price : 0;
                $roomName = $roomItem['room_name'];


                foreach ($group as $ticketPrice) {
                    $totalPrice = $ticketPrice->price + $roomTypePrice;


                    $data[] = [
                        'id' => $counter++, // Tạo id duy nhất
                        'seat_type_name' => $seatTypeName,
                        'room_type_name' => $roomTypeName,
                        'room_name' => $roomName,
                        'day_type' => ucfirst($ticketPrice->day_type),
                        'price' => (int) $totalPrice,
                    ];
                }
            }
        }


        $data = collect($data)->sortBy('id')->values();


        return response()->json([
            'message' => 'Lấy danh sách quản lý vé thành công',
            'data' => $data
        ], 200);
    }


    /**
     * Lấy thông tin chi tiết vé theo ID
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show($id)
    {
        try {
            $ticketPrice = SeatTypePrice::with([
                'seatType',
                'seatType.seat',
                'seatType.seat.room',
                'seatType.seat.room.roomType'
            ])->findOrFail($id);


            $seatType = $ticketPrice->seatType;
            $seatTypeName = $seatType ? $seatType->name : 'Không xác định';


            // Lấy thông tin phòng và loại phòng
            $room = $seatType->seat->first() ? $seatType->seat->first()->room : null;
            $roomName = $room ? $room->name : 'Không xác định';
            $roomType = $room && $room->roomType ? $room->roomType : null;
            $roomTypeName = $roomType ? $roomType->name : 'Không xác định';
            $roomTypePrice = $roomType ? $roomType->price : 0;


            $totalPrice = $ticketPrice->price + $roomTypePrice;


            $data = [
                'ticket_price_id' => $ticketPrice->id,
                'seat_type_name' => $seatTypeName,
                'room_type_name' => $roomTypeName,
                'room_name' => $roomName,
                'day_type' => ucfirst($ticketPrice->day_type),
                'base_price' => (int) $ticketPrice->price,
                'room_type_price' => (int) $roomTypePrice,
                'total_price' => (int) $totalPrice,
                'created_at' => $ticketPrice->created_at,
                'updated_at' => $ticketPrice->updated_at
            ];


            return response()->json([
                'message' => 'Lấy chi tiết vé thành công',
                'data' => $data
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Không tìm thấy vé',
                'error' => $e->getMessage()
            ], 404);
        }
    }


    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'seat_type_name' => 'required|string',
            'room_type_name' => 'required|string|in:2D,3D',
            'day_type' => 'required|string|in:Holiday,Weekday,Weekend',
            'price' => 'required|numeric|min:0',
        ]);


        DB::beginTransaction();
        try {
            $seatType = SeatType::firstOrCreate(
                ['name' => $validated['seat_type_name']],
                ['name' => $validated['seat_type_name']]
            );


            $existingSeatTypePrice = SeatTypePrice::where('seat_type_id', $seatType->id)
                ->where('day_type', $validated['day_type'])
                ->first();


            if ($existingSeatTypePrice) {
                return response()->json([
                    'message' => 'Bản ghi giá vé đã tồn tại cho loại ghế ' . $seatType->name . ' và loại ngày ' . $validated['day_type'] . '. Vui lòng cập nhật thay vì thêm mới.',
                ], 422);
            }


            $roomType = RoomType::firstOrCreate(
                ['name' => $validated['room_type_name']],
                ['name' => $validated['room_type_name']]
            );


            $roomName = $validated['room_type_name'] === '2D' ? 'Cinema 1' : 'Cinema 5';
            $room = Room::firstOrCreate(
                ['name' => $roomName, 'room_type_id' => $roomType->id],
                ['name' => $roomName, 'room_type_id' => $roomType->id]
            );


            $seat = Seat::firstOrCreate(
                ['room_id' => $room->id, 'seat_type_id' => $seatType->id],
                ['room_id' => $room->id, 'seat_type_id' => $seatType->id]
            );


            $seatTypePrice = SeatTypePrice::create([
                'seat_type_id' => $seatType->id,
                'day_type' => $validated['day_type'],
                'price' => $validated['price'],
            ]);


            $result = [
                'seat_type_name' => $seatType->name,
                'room_type_name' => $roomType->name, // Chuỗi đơn giản
                'day_type' => $seatTypePrice->day_type,
                'price' => (int) $seatTypePrice->price,
            ];


            DB::commit();
            return response()->json([
                'message' => 'Thêm giá vé thành công!',
                'data' => $result
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage(),
            ], 500);
        }
    }


    public function update(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'seat_type_name' => 'required|string',
            'room_type_name' => 'required|string|in:2D,3D',
            'day_type' => 'required|string|in:Holiday,Weekday,Weekend',
            'price' => 'required|numeric|min:0',
        ]);


        $seatTypePrice = SeatTypePrice::findOrFail($id);


        DB::beginTransaction();
        try {
            $seatType = SeatType::firstOrCreate(
                ['name' => $validated['seat_type_name']],
                ['name' => $validated['seat_type_name']]
            );


            $roomType = RoomType::firstOrCreate(
                ['name' => $validated['room_type_name']],
                ['name' => $validated['room_type_name']]
            );


            $roomName = $validated['room_type_name'] === '2D' ? 'Cinema 1' : 'Cinema 5';
            $room = Room::firstOrCreate(
                ['name' => $roomName, 'room_type_id' => $roomType->id],
                ['name' => $roomName, 'room_type_id' => $roomType->id]
            );


            $seat = Seat::firstOrCreate(
                ['room_id' => $room->id, 'seat_type_id' => $seatType->id],
                ['room_id' => $room->id, 'seat_type_id' => $seatType->id]
            );


            $seatTypePrice->update([
                'seat_type_id' => $seatType->id,
                'day_type' => $validated['day_type'],
                'price' => $validated['price'],
            ]);


            $result = [
                'seat_type_name' => $seatType->name,
                'room_type_name' => $roomType->name, // Chuỗi đơn giản
                'day_type' => $seatTypePrice->day_type,
                'price' => (int) $seatTypePrice->price,
            ];


            DB::commit();
            return response()->json([
                'message' => 'Cập nhật giá vé thành công!',
                'data' => $result
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage(),
            ], 500);
        }
    }


    // Phương thức xóa vé
    public function destroy($id): JsonResponse
    {
        // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
        DB::beginTransaction();
        try {
            // Tìm bản ghi SeatTypePrice
            $ticketPrice = SeatTypePrice::findOrFail($id);


            // Kiểm tra xem bản ghi có đang được sử dụng hay không (nếu cần)
            // Ví dụ: Kiểm tra xem có Seat nào liên quan đến SeatTypePrice này không
            $relatedSeats = Seat::where('seat_type_id', $ticketPrice->seat_type_id)->exists();
            if ($relatedSeats) {
                return response()->json([
                    'message' => 'Không thể xóa giá vé.',
                ], 422);
            }


            // Xóa bản ghi
            $ticketPrice->delete();


            DB::commit();
            return response()->json([
                'message' => 'Xóa giá vé thành công',
                'ticket_price_id' => $id
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            // Nếu không tìm thấy bản ghi
            DB::rollBack();
            return response()->json([
                'message' => 'Không tìm thấy giá vé với ID: ' . $id,
            ], 404); // 404 Not Found


        } catch (\Illuminate\Database\QueryException $e) {
            // Nếu có lỗi liên quan đến cơ sở dữ liệu (ví dụ: vi phạm ràng buộc khóa ngoại)
            DB::rollBack();
            return response()->json([
                'message' => 'Không thể xóa giá vé do lỗi cơ sở dữ liệu.',
                'error' => $e->getMessage(),
            ], 422);
        } catch (\Exception $e) {
            // Các lỗi khác
            DB::rollBack();
            return response()->json([
                'message' => 'Có lỗi xảy ra khi xóa giá vé.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }














    function saveBooking(array $data, string $status, array $pricing)
    {


        // Kiểm tra xem booking đã tồn tại hay chưa
        return DB::transaction(function () use ($data, $status, $pricing) {
            // Kiểm tra booking trùng lặp như trên
            $existingBooking = Booking::where('user_id', $data['user_id'])
                ->where('showtime_id', $data['showtime_id'])
                ->where('status', 'confirmed')
                ->whereHas('bookingDetails', function ($query) use ($data) {
                    $query->whereIn('seat_id', $data['seat_ids']);
                })
                ->first();


            if ($existingBooking) {
                return $existingBooking;
            }




            // Lưu booking vào bảng bookings
            $booking = Booking::create([
                'user_id' => $data['user_id'],
                'showtime_id' => $data['showtime_id'],
                'total_ticket_price' => $pricing['total_ticket_price'],
                'total_combo_price' => $pricing['total_combo_price'],
                'total_price_point' => $pricing['total_price_point'],
                'total_price_voucher' => $pricing['total_price_voucher'],
                'total_price' => $pricing['total_price'], // Sử dụng total_price từ FE
                'discount_code_id' => $pricing['discount_code_id'] ?? null,
                'status' => $status,
                'payment_method' => $data['payment_method'],
            ]);


            $pricePerSeat = $pricing['total_ticket_price'] / count($data['seat_ids']);


            $showTime = ShowTime::find($data['showtime_id']);
            $roomId = $showTime->room_id;


            $showDate = ShowTimeDate::where('show_time_id', $data['showtime_id'])
                ->value('show_date');


            if (!$showDate) {
                throw new \Exception('Không tìm thấy ngày suất chiếu');
            }


            foreach ($data['seat_ids'] as $seatId) {
                BookingDetail::create([
                    'booking_id' => $booking->id,
                    'seat_id' => $seatId,
                    'price' => $pricePerSeat,
                    'combo_ids' => null,
                    'quantity' => 1,
                ]);


                $showTimeSeat = ShowTimeSeat::where('show_time_id', $data['showtime_id'])
                    ->where('seat_id', $seatId)
                    ->first();


                if ($showTimeSeat) {
                    $showTimeSeat->seat_status = 'booked';
                    $showTimeSeat->save();
                } else {
                    ShowTimeSeat::create([
                        'show_time_id' => $data['showtime_id'],
                        'seat_id' => $seatId,
                        'seat_status' => 'booked'
                    ]);
                }


                $cacheKey = "seat_{$data['showtime_id']}_{$seatId}";
                if (Cache::has($cacheKey)) {
                    Cache::forget($cacheKey);
                }
            }


            // Lưu thông tin combo và giảm quantity
            if (!empty($data['combo_ids'])) {
                $comboQuantities = collect($data['combo_ids'])->groupBy(fn($id) => $id);
                $combos = Combo::whereIn('id', $comboQuantities->keys())->get();


                foreach ($combos as $combo) {
                    $quantity = $comboQuantities[$combo->id]->count();


                    // Kiểm tra quantity của combo
                    if (!isset($combo->quantity)) {
                        Log::warning("Combo ID {$combo->id} does not have a quantity column.");
                        continue;
                    }


                    if ($combo->quantity < $quantity) {
                        throw new \Exception("Combo {$combo->name} không đủ số lượng. Yêu cầu: $quantity, Còn lại: {$combo->quantity}");
                    }


                    // Giảm quantity của combo
                    $combo->quantity -= $quantity;
                    $combo->save();


                    // Lưu vào booking_details
                    $bookingDetail = BookingDetail::create([
                        'booking_id' => $booking->id,
                        'seat_id' => null,
                        'price' => $combo->price,
                        'combo_id' => $combo->id,
                        'quantity' => $quantity,
                    ]);
                }
            }


            // Trừ quantity của discount_code nếu có
            if ($status == 'confirmed' && !empty($pricing['discount_code_id'])) {
                $discount = DiscountCode::find($pricing['discount_code_id']);
                if ($discount) {
                    if ($discount->quantity < 1) {
                        throw new \Exception("Mã khuyến mại {$discount->name_code} đã hết số lượng");
                    }
                    $discount->quantity -= 1;
                    $discount->save();
                }
            }


            broadcast(new SeatHeldEvent(
                $data['seat_ids'],
                $data['user_id'],
                $roomId,
                $data['showtime_id'],
                'booked'
            ))->toOthers();


            $seatingMatrix = $this->getSeatingMatrix($roomId, $data['showtime_id']);
            broadcast(new SeatUpdated($roomId, $data['showtime_id'], $seatingMatrix))->toOthers();


            if ($status == 'confirmed') {
                $userData = $this->userRankService->updateRankAndPoints(
                    $data['user_id'],
                    $pricing['total_price'],
                    $booking->id
                );
                if ($userData === false) {
                    Log::warning("Không tìm thấy người dùng để cập nhật điểm và hạng: user_id = {$data['user_id']}");
                }
            }


            return $booking;
        });
    }


    private function getSeatingMatrix($roomId, $showTimeId)
    {
        $seats = Seat::where('room_id', $roomId)
            ->with(['seatType', 'showTimeSeat' => function ($query) use ($showTimeId) {
                $query->where('show_time_id', $showTimeId);
            }])
            ->get();


        $userId = auth()->id() ?? request()->input('user_id', null); // Lấy từ auth hoặc request nếu có
        $currentDate = now()->toDateString();
        $seatingMatrix = [];


        foreach ($seats as $seat) {
            if (!isset($seatingMatrix[$seat->row])) {
                $seatingMatrix[$seat->row] = [];
            }


            $showTimeSeat = $seat->showTimeSeat->first();
            $status = $showTimeSeat ? $showTimeSeat->seat_status : 'available';


            $cacheKey = "seat_{$showTimeId}_{$seat->id}";
            $heldSeat = Cache::get($cacheKey);
            $isHeld = !empty($heldSeat);
            $heldByUser = $isHeld && $heldSeat['user_id'] == $userId;


            if ($isHeld) {
                $status = 'held';
            } elseif ($status === 'booked') {
                $status = 'booked';
            }


            $seatCode = $seat->row . $seat->column;
            $price = SeatTypePrice::getPriceByDate($seat->seat_type_id, $currentDate) ?? 0;


            $seatingMatrix[$seat->row][$seat->column] = [
                'id' => $seat->id,
                'seatCode' => $seatCode,
                'type' => $seat->seatType->name,
                'status' => $status,
                'isHeld' => $isHeld,
                'heldByUser' => $heldByUser,
                'price' => $price,
            ];
        }


        return array_values($seatingMatrix);
    }


    //---------------------------------------------------***-------------------------------------------------//
    /**
     * Xây dựng thông tin chi tiết của vé.
     *
     * @param \App\Models\Movies $movie
     * @param \App\Models\CalendarShow $calendarShow
     * @param string $showDate
     * @param \App\Models\ShowTime $showTime
     * @param \Illuminate\Support\Collection $seatDetails
     * @param \Illuminate\Support\Collection $combos
     * @param array $pricing
     * @param string $paymentMethod
     * @param \Illuminate\Http\Request $request
     * @return array Thông tin chi tiết của vé
     */
    private function buildTicketDetails($movie, $calendarShow, $showDate, $showTime, $seatDetails, $combos, $pricing, $paymentMethod, $request)
    {
        return [
            'movie' => $movie,
            'calendar_show' => $calendarShow,
            'show_date' => $showDate,
            'show_time' => [
                'start_time' => $showTime->start_time,
                'end_time' => $showTime->end_time,
                'status' => $showTime->status,
                'room' => [
                    'name' => $showTime->room->name,
                    'room_type' => $showTime->room->roomType->name,
                    'price_per_seat' => $showTime->room->roomType->price,
                ],
            ],
            'seats' => $seatDetails,
            'combos' => $combos->map(function ($combo) use ($request) {
                $quantity = collect($request->combo_ids)->filter(fn($id) => $id == $combo->id)->count();
                return [
                    'name' => $combo->name,
                    'description' => $combo->description,
                    'price' => $combo->price,
                    'image' => $combo->image,
                    'quantity' => $quantity,
                    'display' => "$combo->name x$quantity"
                ];
            }),
            'pricing' => $pricing,
            'payment_method' => $paymentMethod,
        ];
    }
    //---------------------------------------------------***-------------------------------------------------//




    //---------------------------------------------------***-------------------------------------------------//
    /**
     * Tạo mã QR từ thông tin booking và ticket details.
     *
     * @param \App\Models\Booking $booking
     * @param array $ticketDetails
     * @return string Mã QR dưới dạng base64
     */
    private function generateQrCode($booking, array $ticketDetails)
    {
        $qrData = "Mã đặt vé: {$booking->id}.\n" .
            "Phim: {$ticketDetails['movie']['title']}.\n" .
            "Ngày chiếu: {$ticketDetails['show_date']}.\n" .
            "Giờ chiếu: {$ticketDetails['show_time']['start_time']} - {$ticketDetails['show_time']['end_time']}.\n" .
            "Phòng: {$ticketDetails['show_time']['room']['name']} ({$ticketDetails['show_time']['room']['room_type']}).\n" .
            "Ghế: " . implode(', ', array_map(fn($seat) => "{$seat['row']}{$seat['column']} ({$seat['seat_type']})", $ticketDetails['seats']->toArray()));


        $qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' . urlencode($qrData);
        return base64_encode(file_get_contents($qrUrl));
    }


    //---------------------------------------------------***-------------------------------------------------//




    public function getTicketDetails(Request $request)
    {
        Log::info('getTicketDetails Request Data: ' . json_encode($request->all()));


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
            'payment_method' => 'required|in:cash,VNpay,PayPal',
            'is_payment_completed' => 'sometimes|boolean',
            'user_id' => 'required|exists:users,id',
            'usedPoints' => 'nullable|integer|min:0',
            'discount_code' => 'nullable|string',
        ]);


        if (empty($request->seat_ids) || !is_array($request->seat_ids)) {
            Log::error('seat_ids is empty or not an array: ' . json_encode($request->all()));
            return response()->json(['message' => 'seat_ids must be a non-empty array'], 400);
        }


        try {
            $movie = Movies::where('id', $request->movie_id)
                ->select('id', 'title', 'rated', 'language', 'poster')
                ->first();


            $calendarShow = CalendarShow::where('id', $request->calendar_show_id)
                ->select('id', 'movie_id', 'show_date', 'end_date')
                ->first();


            $showTime = ShowTime::where('id', $request->showtime_id)
                ->with(['room' => function ($query) {
                    $query->select('id', 'name', 'room_type_id')
                        ->with(['roomType' => function ($query) {
                            $query->select('id', 'name', 'price');
                        }]);
                }])
                ->select('id', 'calendar_show_id', 'room_id', 'start_time', 'end_time', 'status')
                ->first();


            $showDate = ShowTimeDate::where('show_time_id', $request->showtime_id)
                ->value('show_date');


            if (!$showDate) {
                return response()->json(['message' => 'Không tìm thấy ngày suất chiếu'], 400);
            }


            $seats = Seat::whereIn('id', $request->seat_ids)
                ->with(['seatType' => function ($query) {
                    $query->select('id', 'name');
                }])
                ->select('id', 'room_id', 'row', 'column', 'seat_type_id')
                ->get();


            // Tạo seatDetails (không tính giá)
            $seatDetails = $seats->map(function ($seat) {
                return [
                    'row' => $seat->row,
                    'column' => $seat->column,
                    'seat_type' => $seat->seatType->name,
                ];
            });


            $combos = collect([]);
            if ($request->combo_ids) {
                $combos = Combo::whereIn('id', $request->combo_ids)
                    ->select('id', 'name', 'description', 'price', 'image', 'quantity')
                    ->get();
            }


            // Kiểm tra usedPoints
            $usedPoints = $request->input('usedPoints', 0);
            $userData = $this->userRankService->getRankAndPoints($request->user_id);
            $availablePoints = $userData['points'] ?? 0;
            if ($usedPoints > $availablePoints) {
                return response()->json(['message' => 'Số điểm sử dụng vượt quá số điểm hiện có'], 400);
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


                // Kiểm tra số lượng discount code
                if ($discount->quantity < 1) {
                    return response()->json([
                        'success' => false,
                        'message' => "Mã khuyến mại {$discount->name_code} đã hết số lượng",
                        'redirect' => 'http://localhost:5173/booking/payment-result?status=failure&message=' . urlencode("Mã khuyến mại {$discount->name_code} đã hết số lượng"),
                    ], 400);
                }


                $discountCodeId = $discount->id;
            }


            // Kiểm tra số lượng combo trước khi lưu booking
            // if (!empty($request->combo_ids)) {
            //     $comboQuantities = collect($request->combo_ids)->groupBy(fn($id) => $id);
            //     foreach ($combos as $combo) {
            //         $quantity = $comboQuantities[$combo->id]->count();


            //         if (!isset($combo->quantity)) {
            //             Log::warning("Combo ID {$combo->id} does not have a quantity column.");
            //             continue;
            //         }


            //         if ($combo->quantity < $quantity) {
            //             return response()->json([
            //                 'success' => false,
            //                 'message' => "Combo {$combo->name} không đủ số lượng. Yêu cầu: $quantity, Còn lại: {$combo->quantity}",
            //                 'redirect' => 'http://localhost:5173/booking/payment-result?status=failure&message=' . urlencode("Combo {$combo->name} không đủ số lượng. Yêu cầu: $quantity, Còn lại: {$combo->quantity}"),
            //             ], 400);
            //         }
            //     }
            // }


            // Lấy pricing từ request (không tính lại)
            $pricing = [
                'total_ticket_price' => $request->total_ticket_price,
                'total_combo_price' => $request->total_combo_price,
                'total_price_point' => $request->total_price_point,
                'total_price_voucher' => $request->total_price_voucher,
                'total_price_before_discount' => $request->total_ticket_price + $request->total_combo_price,
                'point_discount' => $usedPoints * 1000, // Giả sử 1 điểm = 1000 VNĐ
                'discount_code_id' => $discountCodeId,
                'discount_code' => $discountCode,
                'total_price' => $request->totalPrice, // Sử dụng totalPrice từ FE
                'usedPoints' => $usedPoints,
            ];


            $paymentMethod = $request->payment_method;


            $ticketDetails = $this->buildTicketDetails($movie, $calendarShow, $showDate, $showTime, $seatDetails, $combos, $pricing, $paymentMethod, $request);


            $isPaymentCompleted = $request->input('is_payment_completed', false);
            if ($isPaymentCompleted) {
                $userId = $request->user_id;
                foreach ($request->seat_ids as $seatId) {
                    $showTimeSeat = ShowTimeSeat::where('show_time_id', $request->showtime_id)
                        ->where('seat_id', $seatId)
                        ->first();


                    if ($showTimeSeat && $showTimeSeat->seat_status === 'booked') {
                        return response()->json(['message' => 'Ghế đã được đặt bởi người khác'], 409);
                    }


                    $cacheKey = "seat_{$request->showtime_id}_{$seatId}";
                    $heldSeat = Cache::get($cacheKey);
                    if ($heldSeat && isset($heldSeat['user_id']) && $heldSeat['user_id'] != $userId) {
                        return response()->json(['message' => 'Ghế đang được giữ bởi người khác'], 409);
                    }
                }


                // Lưu booking với pricing từ request
                $booking = $this->saveBooking($request->all(), 'confirmed', $pricing);


                // Trừ điểm nếu sử dụng
                if ($usedPoints > 0) {
                    $success = $this->userRankService->deductPoints($request->user_id, $usedPoints);
                    if (!$success) {
                        Log::warning("Không thể trừ $usedPoints điểm cho user_id = {$request->user_id}");
                    }
                }


                // Trừ quantity của discount_code nếu có
                // if ($discountCodeId) {
                //     $discount = DiscountCode::find($discountCodeId);
                //     if ($discount) {
                //         $discount->quantity -= 1;
                //         $discount->save();
                //     }
                // }


                // Gọi QR code
                $ticketDetails['qr_code'] = $this->generateQrCode($booking, $ticketDetails);


                $user = User::find($request->user_id);
                if ($user && $user->email) {
                    Mail::to($user->email)->send(new BookingConfirmation($booking, $ticketDetails));
                } else {
                    Log::warning('User ID ' . $request->user_id . ' does not have an email.');
                }


                $userData = $this->userRankService->getRankAndPoints($request->user_id);


                return response()->json([
                    'success' => true,
                    'data' => $ticketDetails,
                    'booking_id' => $booking->id,
                    'userData' => $userData ?: null,
                ], 200);
            }


            return response()->json([
                'success' => true,
                'data' => $ticketDetails,
            ], 200);
        } catch (\Exception $e) {
            $message = $e->getMessage();
            return response()->json([
                'success' => false,
                'message' => $message,
                'redirect' => 'http://localhost:5173/booking/payment-result?status=failure&message=' . urlencode($message),
            ], 400);
        }
    }
}



