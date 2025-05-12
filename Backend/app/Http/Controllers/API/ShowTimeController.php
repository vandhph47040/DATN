<?php


namespace App\Http\Controllers\API;


use App\Http\Controllers\Controller;
use App\Models\CalendarShow;
use App\Models\Movies;
use App\Models\Room;
use App\Models\Seat;
use App\Models\ShowTime;
use App\Models\ShowTimeDate;
use App\Models\ShowTimeSeat;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;


class ShowTimeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        $showTime = ShowTime::query()->latest('id')->with(['calendarShow.movie', 'calendarShow', 'room.roomType'])->get();

        return response()->json($showTime, 200);
    }



    public function getDateRangeByCalendarShow(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'calendar_show_id' => 'required|exists:calendar_show,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $calendarShow = CalendarShow::find($request->calendar_show_id);
        $dates = $this->generateDateRange($calendarShow->show_date, $calendarShow->end_date);

        return response()->json([
            'calendar_show' => $calendarShow,
            'dates' => $dates
        ], 200);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate dữ liệu đầu vào
        $validator = Validator::make($request->all(), [
            'calendar_show_id' => 'required|exists:calendar_show,id',
            'room_id' => 'required|exists:rooms,id',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'status' => 'required|in:referenced,now_showing,coming_soon',
            'selected_dates' => 'required|array',
            'selected_dates.*' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $calendarShow = CalendarShow::find($request->calendar_show_id);
        if ($calendarShow->is_public) {
            return response()->json(['error' => 'Không thể thêm suất chiếu cho lịch chiếu đã được áp dụng'], 403);
        }

        // Kiểm tra phòng chiếu
        $room = Room::find($request->room_id);
        if (!$room || !$room->roomType) {
            return response()->json(['error' => 'Phòng chiếu không hợp lệ.'], 422);
        }

        // Kiểm tra ngày được chọn
        $showDate = Carbon::parse($calendarShow->show_date);
        $endDate = Carbon::parse($calendarShow->end_date);
        $selectedDates = $request->selected_dates;

        foreach ($selectedDates as $date) {
            $selectedDate = Carbon::parse($date);
            if ($selectedDate->lt($showDate) || $selectedDate->gt($endDate)) {
                return response()->json(['error' => "Ngày $date không nằm trong khoảng lịch chiếu."], 422);
            }
        }

        // Tạo suất chiếu cho từng ngày
        $createdShowTimes = [];
        foreach ($selectedDates as $date) {
            $selectedDate = Carbon::parse($date);

            // Kiểm tra xung đột thời gian
            $conflictingShowTimes = ShowTime::whereHas('showTimeDate', function ($query) use ($date) {
                $query->whereDate('show_date', $date);
            })
                ->where('room_id', $request->room_id)
                ->where(function ($query) use ($request) {
                    $query->where('start_time', '<', $request->end_time)
                        ->where('end_time', '>', $request->start_time);
                })
                ->exists();

            if ($conflictingShowTimes) {
                continue; // Bỏ qua ngày này nếu có xung đột
            }

            // Tạo suất chiếu
            $showTime = ShowTime::create([
                'calendar_show_id' => $request->calendar_show_id,
                'room_id' => $request->room_id,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
                'status' => $request->status,
                'room_type_id' => $room->roomType->id,
            ]);

            // Tạo ngày chiếu
            ShowTimeDate::create([
                'show_time_id' => $showTime->id,
                'show_date' => $selectedDate->toDateString(),
            ]);

            // Tạo trạng thái ghế
            $seats = Seat::where('room_id', $request->room_id)->get();
            foreach ($seats as $seat) {
                ShowTimeSeat::create([
                    'seat_id' => $seat->id,
                    'show_time_id' => $showTime->id,
                    'seat_status' => 'available',
                ]);
            }

            $createdShowTimes[] = $showTime;
        }
        // Lấy toàn bộ danh sách các ngày trong khoảng show_date và end_date
        // $allDatesInRange = $this->generateDateRange($calendarShow->show_date, $calendarShow->end_date);

        return response()->json([
            'message' => 'Xuất chiếu đã được thêm thành công',
            'data' => $createdShowTimes,
        ], 201);
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {

        $showTime = ShowTime::with(['calendarShow.movie', 'calendarShow', 'room.roomType'])->find($id);

        if (!$showTime) {
            return response()->json(['message' => 'Xuất chiếu không tồn tại'], 404);
        }

        return response()->json($showTime);
    }

    /**
     * Kiểm tra xem suất chiếu có ghế đã được đặt (seat_status = 'booked') hay không
     */
    private function hasBookedSeats($showTime)
    {
        // Kiểm tra xem suất chiếu có ghế nào với seat_status là 'booked' hay không
        return $showTime->showTimeSeat()
            ->where('seat_status', 'booked')
            ->exists();
    }


    public function update(Request $request, string $id)
    {
        // Bước 1: Xác thực dữ liệu đầu vào
        $validated = $request->validate([
            'calendar_show_id' => 'required|exists:calendar_show,id',
            'room_id' => 'required|exists:rooms,id',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'status' => 'required|in:referenced,now_showing,coming_soon',
        ]);

        // Bước 2: Tìm bản ghi ShowTime theo id
        $showTime = ShowTime::find($id);

        if (!$showTime) {
            return response()->json(['message' => 'Không tìm thấy xuất chiếu'], 404);
        }

        $calendarShow = CalendarShow::find($validated['calendar_show_id']);
        if ($calendarShow->is_public) {
            return response()->json(['message' => 'Không thể cập nhật suất chiếu của lịch chiếu đã public'], 403);
        }

        // Bước 3: Kiểm tra nếu status là 'referenced' hoặc 'now_showing'
        if (in_array($showTime->status, ['referenced', 'now_showing'])) {
            return response()->json([
                'message' => 'Không thể cập nhật suất chiếu đang chiếu hoặc đã chiếu'
            ], 403);
        }

        // Bước 4: Kiểm tra xem suất chiếu có ghế đã được đặt không
        if ($this->hasBookedSeats($showTime)) {
            return response()->json([
                'message' => 'Không thể cập nhật suất chiếu vì đã có ghế được đặt'
            ], 403);
        }

        // Bước 5: Kiểm tra xem ngày chiếu có nằm trong khoảng show_date và end_date không
        $showDate = Carbon::parse($calendarShow->show_date);
        $endDate = Carbon::parse($calendarShow->end_date);
        $selectedDate = Carbon::parse($request->input('selected_date'));

        if ($selectedDate->lt($showDate) || $selectedDate->gt($endDate)) {
            return response()->json(['error' => 'Ngày chiếu không hợp lệ'], 422);
        }

        // Bước 6: Kiểm tra xem phòng chiếu có bị trùng lịch không
        try {
            $conflictingShowTimes = ShowTime::where('room_id', $validated['room_id'])
                ->where(function ($query) use ($validated, $id) {
                    $query->where('id', '!=', $id)
                        ->where('start_time', '<', $validated['end_time'])
                        ->where('end_time', '>', $validated['start_time']);
                })
                ->whereHas('showTimeDate', function ($query) use ($selectedDate) {
                    $query->whereDate('show_date', $selectedDate);
                })
                ->exists();
        } catch (\Throwable $th) {
            return response()->json(['error' => $th->getMessage()], 422);
        }

        if ($conflictingShowTimes) {
            return response()->json(['error' => 'Phòng chiếu đã có suất chiếu trùng giờ'], 422);
        }

        // Bước 7: Lấy thông tin phòng và loại phòng
        $room = Room::find($validated['room_id']);
        $roomType = $room ? $room->roomType : null;
        $roomTypeId = $roomType ? $roomType->id : null;

        // Bước 8: Cập nhật thông tin ShowTime
        try {
            $showTime->update([
                'calendar_show_id' => $validated['calendar_show_id'],
                'room_id' => $validated['room_id'],
                'start_time' => $validated['start_time'],
                'end_time' => $validated['end_time'],
                'status' => $validated['status'],
                'room_type_id' => $roomTypeId,
            ]);

            return response()->json([
                'message' => 'Cập nhật xuất chiếu thành công',
                'data' => [
                    'show_time' => $showTime,
                    'room_type' => $roomType ? $roomType->name : null,
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Cập nhật thất bại: ' . $e->getMessage()], 500);
        }
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $showTime = ShowTime::find($id);

        if (!$showTime) {
            return response()->json(['message' => 'Không tìm thấy xuất chiếu'], 404);
        }

        $calendarShow = CalendarShow::find($showTime->calendar_show_id);
        if ($calendarShow->is_public) {
            return response()->json(['message' => 'Không thể xóa suất chiếu của lịch chiếu đã public'], 403);
        }

        // Kiểm tra nếu status là 'referenced' hoặc 'now_showing'
        if (in_array($showTime->status, ['referenced', 'now_showing'])) {
            return response()->json([
                'message' => 'Không thể xóa suất chiếu đang chiếu hoặc đã chiếu'
            ], 403);
        }

        // Kiểm tra xem suất chiếu có ghế đã được đặt không
        if ($this->hasBookedSeats($showTime)) {
            return response()->json([
                'message' => 'Không thể xóa suất chiếu vì đã có ghế được đặt'
            ], 403);
        }

        $showTime->delete();

        return response()->json([
            'message' => 'Xuất chiếu đã được gỡ'
        ], 200);
    }


    //xóa theo ngày
    public function destroyByDate(string $id, string $selected_date)
    {

        // Tìm suất chiếu theo ID
        $showTime = ShowTime::find($id);

        if (!$showTime) {
            return response()->json(['message' => 'Không tìm thấy xuất chiếu'], 404);
        }

        $calendarShow = CalendarShow::find($showTime->calendar_show_id);
        if ($calendarShow->is_public) {
            return response()->json(['message' => 'Không thể xóa suất chiếu của lịch chiếu đã public'], 403);
        }

        // Tìm bản ghi ShowTimeDate theo ngày chiếu đã chọn
        $showTimeDate = $showTime->showTimeDate()->where('show_date', $selected_date)->first();

        if (!$showTimeDate) {
            return response()->json(['message' => 'Không tìm thấy xuất chiếu vào ngày này'], 404);
        }

        // Kiểm tra nếu status là 'referenced' hoặc 'now_showing'
        if (in_array($showTime->status, ['referenced', 'now_showing'])) {
            return response()->json([
                'message' => 'Không thể xóa suất chiếu đang chiếu hoặc đã chiếu'
            ], 403);
        }

        // Kiểm tra xem suất chiếu có ghế đã được đặt không
        if ($this->hasBookedSeats($showTime)) {
            return response()->json([
                'message' => 'Không thể xóa suất chiếu vì đã có ghế được đặt'
            ], 403);
        }

        // Xóa bản ghi ShowTimeDate cho ngày đã chọn
        $showTimeDate->delete();

        return response()->json([
            'message' => 'Xuất chiếu vào ngày ' . $selected_date . ' đã được gỡ'
        ]);
    }




    //------------------------------------showTime-------------------------------------------------
    public function getShowTimesByMovie(Request $request, string $movie_id)
    {
        // Kiểm tra movie_id có tồn tại không
        if (!Movies::where('id', $movie_id)->exists()) {
            return response()->json(['error' => 'Phim không tồn tại'], 404);
        }

        // Query cơ bản để lấy tất cả suất chiếu của phim
        $query = ShowTime::whereHas('calendarShow', function ($query) use ($movie_id) {
            $query->where('movie_id', $movie_id);
        })->with(['calendarShow.movie', 'calendarShow', 'room.roomType', 'showTimeDate']);

        // Lọc theo ngày nếu có
        if ($request->has('date')) {
            if (!strtotime($request->date)) {
                return response()->json(['error' => 'Ngày không hợp lệ'], 422);
            }
            $query->whereHas('showTimeDate', function ($q) use ($request) {
                $q->where('show_date', $request->date);
            });
        }

        // Lọc theo phòng nếu có
        if ($request->has('room_id')) {
            $query->where('room_id', $request->query('room_id'));
        }

        // Lọc theo loại phòng nếu có
        if ($request->has('room_type_id')) {
            $query->whereHas('room', function ($q) use ($request) {
                $q->where('room_type_id', $request->query('room_type_id'));
            });
        }

        // Lấy danh sách suất chiếu
        $showTimes = $query->get();

        if ($showTimes->isEmpty()) {
            return response()->json(['message' => 'Không có suất chiếu nào cho phim này'], 404);
        }

        // Tùy chỉnh dữ liệu trả về
        $result = $showTimes->map(function ($showTime) {
            return [
                'id' => $showTime->id,
                'calendar_show_id' => $showTime->calendar_show_id,
                'movie' => $showTime->calendarShow->movie->title ?? null,
                'start_time' => $showTime->start_time,
                'end_time' => $showTime->end_time,
                'status' => $showTime->status,
                'room' => [
                    'id' => $showTime->room->id ?? null,
                    'name' => $showTime->room->name ?? null,
                    'room_type' => [
                        'name' => $showTime->room->roomType->name ?? null,
                    ],
                ],
                'show_date' => $showTime->showTimeDate->first()->show_date ?? null,
            ];
        });

        return response()->json([
            'movie_id' => $movie_id,
            'show_times' => $result
        ], 200);
    }

    public function getShowTimesByDateClient(string $movie_id, string $date, Request $request)
    {
        // Kiểm tra movie_id có tồn tại không
        if (!Movies::where('id', $movie_id)->exists()) {
            return response()->json(['error' => 'Phim không tồn tại'], 404);
        }


        // Kiểm tra `date` có hợp lệ không
        if (!strtotime($date)) {
            return response()->json(['error' => 'Ngày không hợp lệ'], 422);
        }


        // Lấy tất cả suất chiếu của phim theo ngày
        $showTimeIds = ShowTimeDate::where('show_date', $date)
            ->whereHas('showTime.calendarShow', function ($query) use ($movie_id) {
                $query->where('movie_id', $movie_id)
                    ->where('is_public', true); //lịch chiếu đã public
            })
            ->pluck('show_time_id');


        if ($showTimeIds->isEmpty()) {
            return response()->json(['message' => 'Không có suất chiếu nào cho ngày này'], 404);
        }

        // Query các ShowTime
        $query = ShowTime::whereIn('id', $showTimeIds)
            ->with(['calendarShow.movie', 'calendarShow', 'room.roomType']);

        // Lọc theo phòng nếu có
        if ($request->has('room_id')) {
            $query->where('room_id', $request->query('room_id'));
        }

        // Lọc theo room_type nếu có
        if ($request->has('room_type_id')) {
            $query->whereHas('room', function ($query) use ($request) {
                $query->where('room_type_id', $request->query('room_type_id'));
            });
        }

        $showTimes = $query->get();

        return response()->json([
            'movie_id' => $movie_id,
            'date' => $date,
            'show_times' => $showTimes
        ]);
    }

    public function getShowTimesByDate(Request $request)
    {

        // Validate dữ liệu đầu vào
        $validator = Validator::make($request->all(), [
            'date' => 'required|date',
            'room_id' => 'required|exists:rooms,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Lấy tất cả show_time_id có trong ngày đã chọn
        $showTimeIds = ShowTimeDate::where('show_date', $request->date)
            ->pluck('show_time_id');

        if ($showTimeIds->isEmpty()) {
            return response()->json(['message' => 'Không có suất chiếu nào cho ngày này'], 404);
        }

        // Query các ShowTime
        $query = ShowTime::whereIn('id', $showTimeIds)
            ->with(['calendarShow.movie', 'calendarShow', 'room']);

        // Thêm điều kiện lọc theo phòng nếu có
        if ($request->has('room_id')) {
            $query->where('room_id', $request->room_id);
        }

        $showTimes = $query->get();

        return response()->json($showTimes, 200);
    }

    //hàm hiển thị khoảng ngày giữa show_date và end_date
    public function generateDateRange($startDate, $endDate)
    {

        // Tạo một mảng chứa tất cả các ngày trong khoảng từ show_date đến end_date
        $dates = [];
        $currentDate = Carbon::parse($startDate);

        // Duyệt qua tất cả các ngày trong khoảng
        while ($currentDate <= Carbon::parse($endDate)) {
            $dates[] = $currentDate->toDateString(); // Thêm ngày vào mảng dưới dạng YYYY-MM-DD
            $currentDate->addDay(); // Tăng 1 ngày
        }

        return $dates;
    }


    //hàm lọc theo lịch chiếu

    /**                                
     * Hiển thị tất cả suất chiếu trong khoảng ngày từ bảng calendar_show
     */
    public function getShowTimesInDateRange(Request $request)
    {

        // Validate dữ liệu đầu vào
        $validator = Validator::make($request->all(), [
            'show_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:show_date',
            'room_id' => 'nullable|exists:rooms,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $showDate = $request->show_date;
        $endDate = $request->end_date;

        // Tìm tất cả calendar_show có ngày chiếu trong khoảng
        $calendarShows = CalendarShow::where(function ($query) use ($showDate, $endDate) {
            // Trường hợp 1: show_date nằm trong khoảng từ start_date đến end_date
            $query->whereBetween('show_date', [$showDate, $endDate]);
            // HOẶC Trường hợp 2: end_date nằm trong khoảng từ start_date đến end_date
            $query->orWhereBetween('end_date', [$showDate, $endDate]);
            // HOẶC Trường hợp 3: khoảng thời gian của calendar_show bao trùm khoảng thời gian tìm kiếm
            $query->orWhere(function ($q) use ($showDate, $endDate) {
                $q->where('show_date', '<=', $showDate)
                    ->where('end_date', '>=', $endDate);
            });
        })->get();

        if ($calendarShows->isEmpty()) {
            return response()->json(['message' => 'Không có lịch chiếu nào trong khoảng ngày này'], 404);
        }

        // Lấy tất cả suất chiếu thuộc các calendar_show tìm được
        $query = ShowTime::whereIn('calendar_show_id', $calendarShows->pluck('id'))
            ->with(['calendarShow.movie', 'calendarShow', 'room', 'showTimeDate']);

        // Thêm điều kiện lọc theo phòng nếu có
        if ($request->has('room_id')) {
            $query->where('room_id', $request->room_id);
        }

        $showTimes = $query->get();

        // Lọc chỉ những suất chiếu có showTimeDate trong khoảng ngày
        $filteredShowTimes = $showTimes->filter(function ($showTime) use ($showDate, $endDate) {
            foreach ($showTime->showTimeDate as $date) {
                if ($date->show_date >= $showDate && $date->show_date <= $endDate) {
                    return true;
                }
            }
            return false;
        });

        if ($filteredShowTimes->isEmpty()) {
            return response()->json(['message' => 'Không có suất chiếu nào được đặt trong khoảng ngày này'], 404);
        }

        $filteredShowTimes->transform(function ($showTime) {
            $room = $showTime->room;
            $roomType = $room ? $room->roomType : null;

            // Thêm thông tin về loại phòng vào mỗi suất chiếu
            $showTime->room_type = $roomType ? $roomType->name : null;
            return $showTime;
        });

        return response()->json($filteredShowTimes->values(), 200);
    }


    public function getShowTimesByCalendarShowId(Request $request)
    {
        // Lấy calendar_show_id từ request body
        $calendarShowId = $request->input('calendar_show_id');

        // Kiểm tra nếu không có calendar_show_id
        if (!$calendarShowId) {
            return response()->json(['error' => 'Thiếu calendar_show_id'], 400);
        }

        // Lấy danh sách suất chiếu theo calendar_show_id
        $showTimes = ShowTime::where('calendar_show_id', $calendarShowId)
            ->with(['calendarShow.movie', 'calendarShow'])
            ->get();


        if ($showTimes->isEmpty()) {
            return response()->json(['message' => 'Không tìm thấy suất chiếu nào'], 404);
        }

        return response()->json($showTimes, 200);
    }
}
