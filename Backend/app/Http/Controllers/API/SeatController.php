<?php

namespace App\Http\Controllers\API;

use App\Events\SeatHeldEvent;
use App\Events\SeatUpdated;
use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\Seat;
use App\Models\SeatType;
use App\Models\SeatTypePrice;
use App\Models\ShowTime;
use App\Models\ShowTimeSeat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class SeatController extends Controller
{

    //hiển thị ghế theo thời gian thực
    public function getSeatsForBooking($room_id, $showTimeId)
    {
        $showtime = ShowTime::with('showTimeDate')
            ->find($showTimeId);
        if (!$showtime) {
            return response()->json(['error' => 'Suất chiếu không tìm thấy'], 404);
        }

        $showtimeDateRecord = $showtime->showTimeDate->first();
        if (!$showtimeDateRecord) {
            return response()->json(['error' => 'Ngày suất chiếu không tìm thấy'], 404);
        }
        $showtimeDate = $showtimeDateRecord->show_date;

        $seats = Seat::where('room_id', $room_id)
            ->with(['seatType', 'showTimeSeat' => function ($query) use ($showTimeId) {
                $query->where('show_time_id', $showTimeId);
            }])
            ->get();
        $userId = auth()->id();

        $seatingMatrix = [];
        foreach ($seats as $seat) {
            if (!isset($seatingMatrix[$seat->row])) {
                $seatingMatrix[$seat->row] = [];
            }

            $seatStatus = $seat->status ?? 'available';
            $showTimeSeat = $seat->showTimeSeat->first();
            $showTimeSeatStatus = $showTimeSeat ? $showTimeSeat->seat_status : 'available';

            // Sửa key để khớp với key trong holdSelectedSeats
            $heldSeat = Cache::get("seat_{$showTimeId}_{$seat->id}");
            $isHeld = !empty($heldSeat);
            $heldByUser = $isHeld && $heldSeat['user_id'] == $userId;

            if ($isHeld) {
                $showTimeSeatStatus = 'held';
            }

            $seatCode = $seat->row . $seat->column;
            $price = SeatTypePrice::getPriceByDate($seat->seat_type_id, $showtimeDate) ?? 0;

            $seatingMatrix[$seat->row][$seat->column] = [
                'id' => $seat->id,
                'seatCode' => $seatCode,
                'type' => $seat->seatType->name,
                'adminStatus' => $seatStatus,
                'status' => $showTimeSeatStatus,
                'isHeld' => $isHeld,
                'heldByUser' => $heldByUser,
                'price' => $price,
            ];
        }

        broadcast(new SeatUpdated($room_id, $showTimeId, $seatingMatrix))->toOthers();
        return response()->json(array_values($seatingMatrix));
    }

    //Cập nhật trạng thái ghế theo thời gian thực khi chọn ghế
    public function holdSelectedSeats(Request $request)
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'seats' => 'required|array|max:8',
            'seats.*' => 'numeric|exists:seats,id',
            'room_id' => 'required|numeric|exists:rooms,id',
            'showtime_id' => 'required|numeric|exists:show_times,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $seats = $request->input('seats');
        $roomId = $request->input('room_id');
        $showTimeId = $request->input('showtime_id');
        $userId = auth()->id();
        $expiresAt = now()->addMinutes(7);

        // Sử dụng lock để tránh xung đột
        return Cache::lock("hold_seats_{$userId}_{$showTimeId}", 10)->block(2, function () use ($seats, $roomId, $showTimeId, $userId, $expiresAt) {
            // Kiểm tra tổng số ghế đang giữ của người dùng
            $userSeatsKey = "user_seats_{$userId}_{$showTimeId}";
            $currentHeldSeats = Cache::get($userSeatsKey, []);
            $totalSeats = count($currentHeldSeats) + count($seats);

            if ($totalSeats > 8) {
                return response()->json([
                    'message' => 'Bạn chỉ có thể giữ tối đa 8 ghế!',
                    'current_held' => count($currentHeldSeats),
                    'requested' => count($seats)
                ], 400);
            }

            // Kiểm tra trạng thái ghế
            foreach ($seats as $seatId) {
                $seat = Seat::find($seatId);
                if ($seat->status === 'disabled' || $seat->status === 'empty') {
                    return response()->json([
                        'message' => 'Ghế đang bảo trì, vui lòng chọn ghế khác!',
                        'seat_id' => $seatId,
                        'status' => $seat->status
                    ], 400);
                }

                $cacheKey = "seat_{$showTimeId}_{$seatId}";
                $heldSeat = Cache::get($cacheKey);
                if (!empty($heldSeat) && $heldSeat['user_id'] !== $userId && $heldSeat['expires_at'] > now()) {
                    return response()->json(['message' => 'Ghế đã được giữ bởi người khác!'], 409);
                }
            }

            // Lưu ghế vào Cache
            $newSeats = [];
            foreach ($seats as $seatId) {
                $cacheKey = "seat_{$showTimeId}_{$seatId}";
                Cache::put($cacheKey, ['user_id' => $userId, 'expires_at' => $expiresAt], $expiresAt);
                $newSeats[] = (int)$seatId;
            }

            // Cập nhật danh sách ghế của người dùng
            $updatedHeldSeats = array_unique(array_merge($currentHeldSeats, $newSeats));
            Cache::put($userSeatsKey, $updatedHeldSeats, $expiresAt);

            // Phát sự kiện
            broadcast(new SeatHeldEvent(
                $seats,
                $userId,
                $roomId,
                $showTimeId,
                'held'
            ));

            return response()->json([
                'message' => 'Ghế đã được giữ!',
                'seats' => $seats,
                'expires_at' => $expiresAt,
                'user_id' => $userId
            ]);
        }) ?: response()->json(['message' => 'Không thể xử lý yêu cầu do xung đột!'], 429);
    }

    /**
     * Giải phóng ghế nếu người dùng không đặt vé sau 5 phút
     */
    public function releaseSeat(Request $request)
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'seats' => 'required|array',
            'seats.*' => 'numeric|exists:seats,id',
            'room_id' => 'required|numeric|exists:rooms,id',
            'showtime_id' => 'required|numeric|exists:show_times,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $seats = $request->input('seats');
        $roomId = $request->input('room_id');
        $showTimeId = $request->input('showtime_id');
        $userId = auth()->id();

        if (!is_array($seats) || empty($seats)) {
            return response()->json([
                'message' => 'Danh sách ghế không hợp lệ!',
            ], 400);
        }

        // Sử dụng lock để tránh xung đột
        return Cache::lock("hold_seats_{$userId}_{$showTimeId}", 10)->block(2, function () use ($seats, $roomId, $showTimeId, $userId) {
            $releasedSeats = [];
            $failedSeats = [];

            // Lấy danh sách ghế của người dùng
            $userSeatsKey = "user_seats_{$userId}_{$showTimeId}";
            $currentHeldSeats = Cache::get($userSeatsKey, []);

            foreach ($seats as $seatId) {
                $cacheKey = "seat_{$showTimeId}_{$seatId}";
                $heldSeat = Cache::get($cacheKey);

                // Chỉ giải phóng nếu ghế do người dùng này giữ và chưa hết hạn
                if ($heldSeat && $heldSeat['user_id'] === $userId && $heldSeat['expires_at'] > now()) {
                    Cache::forget($cacheKey);
                    $releasedSeats[] = (int)$seatId;
                } else {
                    $failedSeats[] = (int)$seatId;
                }
            }

            // Cập nhật danh sách ghế của người dùng
            if (!empty($releasedSeats)) {
                $updatedHeldSeats = array_diff($currentHeldSeats, $releasedSeats);
                if (empty($updatedHeldSeats)) {
                    Cache::forget($userSeatsKey);
                } else {
                    Cache::put($userSeatsKey, array_values($updatedHeldSeats), now()->addMinutes(7));
                }
            }

            if (empty($releasedSeats)) {
                return response()->json([
                    'message' => 'Tất cả ghế chưa được giữ hoặc đã được giải phóng trước đó!',
                    'failed_seats' => $failedSeats
                ], 404);
            }

            // Phát sự kiện
            broadcast(new SeatHeldEvent(
                $releasedSeats,
                null,
                $roomId,
                $showTimeId,
                'released'
            ))->toOthers();

            return response()->json([
                'message' => 'Ghế đã được giải phóng!',
                'seats' => $releasedSeats,
                'failed_seats' => $failedSeats
            ]);
        }) ?: response()->json(['message' => 'Không thể xử lý yêu cầu do xung đột!'], 429);
    }

    /**
     * Cập nhật trạng thái ghế theo room_id và seat_id
     */
    public function updateSeatStatusForRoom(Request $request, $roomId)
    {
        try {
            $status = $request->input('seat_status');
            $seatId = $request->input('seat_id');

            if (!$status) {
                return response()->json(['message' => 'Trạng thái ghế (seat_status) là bắt buộc'], 400);
            }
            if (!$seatId || !is_numeric($seatId)) {
                return response()->json(['message' => 'ID ghế (seat_id) là bắt buộc và phải là một số'], 400);
            }
            if (!in_array($status, ['available', 'booked', 'disabled', 'empty'])) {
                return response()->json(['message' => 'Trạng thái ghế không hợp lệ!'], 400);
            }

            $seat = Seat::where('id', $seatId)->where('room_id', $roomId)->first();
            if (!$seat) {
                return response()->json(['message' => "Không tìm thấy ghế ID {$seatId} thuộc phòng ID {$roomId}"], 400);
            }

            $showTimeIds = Showtime::where('room_id', $roomId)->pluck('id');

            // Kiểm tra ghế có đang bị giữ không
            foreach ($showTimeIds as $showTimeId) {
                $cacheKey = "seat_{$showTimeId}_{$seat->id}";
                if (Cache::has($cacheKey)) {
                    return response()->json(['message' => "Ghế ID {$seatId} đang được giữ, không thể cập nhật trạng thái!"], 409);
                }
            }

            $seat->update(['status' => $status]);
            Log::info("Updated seat status to '{$status}' for Seat ID: {$seatId}");

            return response()->json(['message' => "Đã cập nhật trạng thái ghế ID {$seatId} thành '{$status}'"], 200);
        } catch (\Exception $e) {
            Log::error("Error updating seat status: {$e->getMessage()}");
            return response()->json(['message' => 'Đã xảy ra lỗi khi cập nhật trạng thái ghế', 'error' => $e->getMessage()], 500);
        }
    }




    /**
     * Cập nhật trạng thái ghế
     */
    public function updateSeatStatus(Request $request)
    {
        // Kiểm tra yêu cầu có chứa 'show_time_id' và 'seats' không
        if (!$request->has('show_time_id') || !$request->has('seats') || !is_array($request->seats)) {
            return response()->json(['error' => 'Thiếu show_time_id hoặc danh sách ghế không hợp lệ'], 400);
        }

        // Lấy show_time_id và danh sách ghế từ yêu cầu
        $show_time_id = $request->show_time_id;
        $seatsData = $request->seats;

        // Kiểm tra suất chiếu có tồn tại không
        $showTime = ShowTime::find($show_time_id);
        if (!$showTime) {
            return response()->json(['error' => 'Suất chiếu không tồn tại'], 404);
        }

        // Mảng lưu thông báo về ghế đã được cập nhật
        $updatedSeats = [];

        // Duyệt qua tất cả ghế để cập nhật trạng thái
        foreach ($seatsData as $seatData) {
            // Kiểm tra nếu thiếu seat_id hoặc seat_status
            if (!isset($seatData['seat_id']) || !isset($seatData['seat_status'])) {
                return response()->json(['error' => 'Mỗi ghế cần có seat_id và seat_status'], 400);
            }

            $seat_id = $seatData['seat_id'];
            $seat_status = $seatData['seat_status'];

            // Kiểm tra trạng thái ghế hợp lệ
            if (!in_array($seat_status, ['available', 'booked'])) {
                return response()->json(['error' => 'Trạng thái ghế không hợp lệ'], 400);
            }

            // Tìm ghế theo seat_id
            $seat = Seat::find($seat_id);
            if (!$seat) {
                return response()->json(['error' => 'Ghế không tồn tại'], 404);
            }

            // Tìm bản ghi trong bảng show_time_seats
            $showTimeSeat = ShowTimeSeat::where('show_time_id', $show_time_id)
                ->where('seat_id', $seat_id)
                ->first();

            if (!$showTimeSeat) {
                return response()->json(['error' => 'Ghế không thuộc suất chiếu này'], 404);
            }

            // Cập nhật trạng thái ghế
            $showTimeSeat->seat_status = $seat_status;
            $showTimeSeat->save();

            // Thêm ghế vào mảng đã cập nhật
            $updatedSeats[] = [
                'seat_id' => $seat_id,
                'seat_status' => $seat_status
            ];
        }

        return response()->json([
            'message' => 'Cập nhật trạng thái ghế thành công',
            'updated_seats' => $updatedSeats
        ], 200);
    }

    /**
     * Lấy ghế theo id phòng (dành cho admin)
     */
    public function getSeats($room_id)
    {
        // Lấy tất cả ghế trong phòng
        $seats = Seat::where('room_id', $room_id)
            ->with(['seatType'])
            ->get();

        if ($seats->isEmpty()) {
            return response()->json([
                'message' => 'Không tìm thấy ghế trong phòng này',
                'seatingMatrix' => []
            ], 404);
        }

        $seatingMatrix = [];
        foreach ($seats as $seat) {
            if (!isset($seatingMatrix[$seat->row])) {
                $seatingMatrix[$seat->row] = [];
            }

            $seatCode = $seat->row . $seat->column;

            // Lấy giá ghế hiện tại
            $currentDate = date('Y-m-d');
            $price = SeatTypePrice::getPriceByDate($seat->seat_type_id, $currentDate) ?? 0;

            // Chỉ lấy trạng thái từ bảng seats
            $seatStatus = $seat->status ?? 'available';

            // Chuẩn hóa trạng thái ghế (chuyển về chữ thường)
            $seatStatus = strtolower(trim($seatStatus));

            $seatingMatrix[$seat->row][$seat->column] = [
                'id' => $seat->id,
                'seatCode' => $seatCode,
                'type' => $seat->seatType->name,
                'status' => $seatStatus,
                'price' => $price,
            ];
        }

        // Theo hình ảnh console, response trả về trực tiếp seatingMatrix
        return response()->json($seatingMatrix, 200);
    }


    private function getSeatTypeByRow($row)
    {

        //gán loại ghế dựa theo hàng
        if (in_array($row, ['A', 'B', 'C'])) {
            return SeatType::where('name', 'Thường')->first();
        } elseif (in_array($row, ['D', 'E', 'F', 'G', 'H'])) {
            return SeatType::where('name', 'VIP')->first();
        } elseif ($row === 'J') {
            return SeatType::where('name', 'Sweetbox')->first();
        } else {
            return SeatType::where('name', 'Thường')->first();  // Mặc định là loại ghế Thường
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Xác thực dữ liệu
        $validator = Validator::make($request->all(), [
            'room_id' => 'required|exists:rooms,id',
            'row' => 'required|max:20',
            'column' => 'required|max:10',
            'seat_type_id' => 'required|exists:seat_types,id',
        ]);

        // Kiểm tra nếu có lỗi xác thực
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Kiểm tra ghế có tồn tại trong phòng chưa
        $existingSeat = Seat::where('room_id', $request->room_id)
            ->where('row', $request->row)
            ->where('column', $request->column)
            ->first();

        if ($existingSeat) {
            return response()->json(['message' => 'Ghế đã tồn tại'], 400);
        }

        //Lấy dữ liệu 
        $data = $request->all();

        // Tạo ghế mới
        $seat = Seat::query()->create($data);

        // Cập nhật capacity của phòng
        $room = Room::find($seat->room_id);
        if ($room) {
            $seatCount = Seat::where('room_id', $room->id)->count();
            $room->capacity = $seatCount;
            $room->save();
        }

        // Trả về phản hồi thành công
        return response()->json(['message' => 'Thêm ghế thành công', 'data' => $seat], 201);
    }

    /**
     * Store multiple seats using query parameters.
     */
    public function storeMultiple(Request $request)
    {
        // Lấy tham số seats từ query parameters
        $seatsParam = $request->query('seats');

        // Kiểm tra nếu không có tham số seats
        if (!$seatsParam) {
            return response()->json(['error' => 'Tham số seats là bắt buộc'], 400);
        }

        // Parse chuỗi JSON thành mảng
        try {
            $seatsData = json_decode($seatsParam, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                return response()->json(['error' => 'Tham số seats không đúng định dạng JSON'], 400);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Lỗi khi parse JSON: ' . $e->getMessage()], 400);
        }

        // Kiểm tra nếu seats không phải là mảng hoặc rỗng
        if (!is_array($seatsData) || empty($seatsData)) {
            return response()->json(['error' => 'Tham số seats phải là một mảng không rỗng'], 400);
        }

        // Xác thực dữ liệu
        $validator = Validator::make(['seats' => $seatsData], [
            'seats' => 'required|array|min:1',
            'seats.*.room_id' => 'required|exists:rooms,id',
            'seats.*.row' => 'required|max:20',
            'seats.*.column' => 'required|max:10',
            'seats.*.seat_type_id' => 'required|exists:seat_types,id',
        ]);

        // Kiểm tra nếu có lỗi xác thực
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $newSeats = [];
        $errors = [];
        $roomIds = [];

        // Kiểm tra trùng lặp và chuẩn bị dữ liệu để thêm
        foreach ($seatsData as $index => $seatData) {
            // Kiểm tra ghế có tồn tại trong phòng chưa
            $existingSeat = Seat::where('room_id', $seatData['room_id'])
                ->where('row', $seatData['row'])
                ->where('column', $seatData['column'])
                ->first();

            if ($existingSeat) {
                $errors[] = "Ghế tại hàng {$seatData['row']}, cột {$seatData['column']} trong phòng {$seatData['room_id']} đã tồn tại (index: $index)";
                continue;
            }

            // Thêm dữ liệu ghế vào mảng để insert
            $newSeats[] = [
                'room_id' => $seatData['room_id'],
                'row' => $seatData['row'],
                'column' => $seatData['column'],
                'seat_type_id' => $seatData['seat_type_id'],
                'created_at' => now(),
                'updated_at' => now(),
            ];

            // Lưu room_id để cập nhật capacity sau
            if (!in_array($seatData['room_id'], $roomIds)) {
                $roomIds[] = $seatData['room_id'];
            }
        }

        // Nếu có lỗi trùng lặp, trả về thông báo lỗi
        if (!empty($errors)) {
            return response()->json([
                'message' => 'Một số ghế không thể thêm do đã tồn tại',
                'errors' => $errors,
            ], 400);
        }

        // Thêm tất cả ghế mới vào cơ sở dữ liệu
        if (!empty($newSeats)) {
            Seat::insert($newSeats);

            // Cập nhật capacity cho các phòng liên quan
            foreach ($roomIds as $roomId) {
                $room = Room::find($roomId);
                if ($room) {
                    $seatCount = Seat::where('room_id', $room->id)->count();
                    $room->capacity = $seatCount;
                    $room->save();
                }
            }

            // Lấy lại danh sách ghế vừa thêm để trả về
            $insertedSeats = Seat::whereIn('room_id', $roomIds)
                ->where('created_at', '>=', now()->subSeconds(5))
                ->get();

            return response()->json([
                'message' => 'Thêm nhiều ghế thành công',
                'data' => $insertedSeats,
            ], 201);
        }

        return response()->json(['message' => 'Không có ghế nào được thêm'], 400);
    }

    public function destroy($seatId)
    {
        $seat = Seat::findOrFail($seatId);
        $showTimeIds = Showtime::where('room_id', $seat->room_id)->pluck('id');

        // Kiểm tra nếu ghế này bị giữ trong bất kỳ suất chiếu nào
        foreach ($showTimeIds as $showTimeId) {
            $cacheKey = "seat_{$showTimeId}_{$seat->id}";
            if (Cache::has($cacheKey)) {
                return response()->json(['message' => 'Ghế đang được giữ, không thể xóa!'], 409);
            }
        }

        $roomId = $seat->room_id;
        $seat->delete();

        // Cập nhật capacity của phòng
        $room = Room::find($roomId);
        if ($room) {
            $seatCount = Seat::where('room_id', $room->id)->count();
            $room->capacity = $seatCount;
            $room->save();
        }
        return response()->json(['message' => 'Ghế đã được xóa thành công'], 200);
    }



    public function deleteAll($roomId)
    {
        $seats = Seat::where('room_id', $roomId)->get();
        $showTimeIds = Showtime::where('room_id', $roomId)->pluck('id');

        // Kiểm tra nếu có ghế nào đang bị giữ
        foreach ($seats as $seat) {
            foreach ($showTimeIds as $showTimeId) {
                $cacheKey = "seat_{$showTimeId}_{$seat->id}";
                if (Cache::has($cacheKey)) {
                    return response()->json(['message' => "Ghế ID {$seat->id} đang được giữ, không thể xóa!"], 409);
                }
            }
        }

        foreach ($seats as $seat) {
            $seat->delete();
        }

        // Cập nhật capacity của phòng
        $room = Room::find($roomId);
        if ($room) {
            $seatCount = Seat::where('room_id', $roomId)->count();
            $room->capacity = $seatCount;
            $room->save();
        }
        return response()->json(['message' => 'Đã xóa tất cả ghế trong phòng thành công'], 200);
    }





    public function update($seatId, Request $request)
    {
        $seat = Seat::findOrFail($seatId);
        $showTimeIds = Showtime::where('room_id', $seat->room_id)->pluck('id');

        // Kiểm tra ghế có đang bị giữ không
        foreach ($showTimeIds as $showTimeId) {
            $cacheKey = "seat_{$showTimeId}_{$seat->id}";
            if (Cache::has($cacheKey)) {
                return response()->json(['message' => 'Ghế đang được giữ, không thể cập nhật!'], 409);
            }
        }

        // Xác thực dữ liệu
        $validator = Validator::make($request->all(), [
            'row' => 'sometimes|max:20',
            'column' => 'sometimes|max:10',
            'seat_type_id' => 'sometimes|exists:seat_types,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Cập nhật ghế
        $seat->update($request->only(['row', 'column', 'seat_type_id']));

        return response()->json(['message' => 'Cập nhật ghế thành công', 'data' => $seat->load('seatType')], 200);
    }
}
