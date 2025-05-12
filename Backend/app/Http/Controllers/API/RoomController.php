<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\Seat;
use App\Models\ShowTime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;

class RoomController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Lấy danh sách phòng
        $rooms = Room::query()->latest('id')->get();
        $roomsTrashed = Room::onlyTrashed()->latest('id')->get();

        // Trả về phản hồi dạng JSON với cấu trúc dữ liệu phân trang đầy đủ
        return response()->json([
            'message' => 'Danh sách phòng',
            'rooms' => $rooms,
            'trashed_rooms' => $roomsTrashed,
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            // Lấy dữ liệu JSON từ request
            $data = $request->json()->all();

            // Kiểm tra dữ liệu nhập vào
            $validator = Validator::make($data, [
                'name' => 'required|unique:rooms,name',
                'room_type_id' => 'required|exists:room_types,id',
                'background_img' => 'nullable|string'
            ]);

            // Nếu có lỗi validate, trả về lỗi
            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 422);
            }

            // Tạo phòng mới trong database
            $room = Room::create([
                'name' => $data['name'],
                'room_type_id' => $data['room_type_id'],
                'capacity' => 0, // Gán mặc định là 0, sẽ cập nhật sau
                'background_img' => $data['background_img'] ?? null,
            ]);

            // Tính capacity dựa trên số ghế liên kết với room_id
            $seatCount = Seat::where('room_id', $room->id)->count();
            $room->capacity = $seatCount;
            $room->save();

            // Trả về kết quả thành công
            return response()->json([
                'message' => 'Thêm phòng thành công',
                'room' => $room
            ], 201);
        } catch (\Exception $e) {
            // Nếu có lỗi, trả về thông tin lỗi (để debug)
            return response()->json([
                'error' => 'Đã xảy ra lỗi trong quá trình xử lý.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $room = Room::find($id);

        // Nếu không tìm thấy phòng
        if (!$room) {
            return response()->json(['message' => 'Không tìm thấy phòng'], 404);
        }
        return response()->json($room);
    }

    public function updateBackground(Request $request, string $id)
    {
        try {

            $room = Room::find($id);


            // Nếu không tìm thấy phòng
            if (!$room) {
                return response()->json(['message' => 'Không tìm thấy phòng'], 404);
            }


            // Lấy dữ liệu JSON từ request
            $data = $request->json()->all();



            $validator = Validator::make($data, [
                'background_img' => 'nullable|string'
            ]);



            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 422);
            }



            $room->update([
                'background_img' => $data['background_img'] ?? $room->background_img
            ]);


            // Trả về kết quả thành công
            return response()->json([
                'message' => 'Cập nhật hình nền phòng thành công',
                'room' => $room
            ], 200);
        } catch (\Exception $e) {
            // Nếu có lỗi, trả về thông tin lỗi (để debug)
            return response()->json([
                'error' => 'Đã xảy ra lỗi trong quá trình xử lý.',
                'details' => $e->getMessage()
            ], 500);
        }
    }



    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            // Tìm phòng theo id
            $room = Room::find($id);

            // Nếu không tìm thấy phòng
            if (!$room) {
                return response()->json(['message' => 'Không tìm thấy phòng'], 404);
            }

            // Kiểm tra xem phòng có suất chiếu hay không
            $hasShowTimes = ShowTime::where('room_id', $room->id)->exists();
            if ($hasShowTimes) {
                return response()->json([
                    'message' => 'Không thể cập nhật phòng vì phòng đang có suất chiếu.'
                ], 403);
            }

            // Lấy dữ liệu JSON từ request
            $data = $request->json()->all();

            // Kiểm tra dữ liệu nhập vào
            $validator = Validator::make($data, [
                'name' => 'required|unique:rooms,name,' . $id,
                'room_type_id' => 'required|exists:room_types,id',
                'background_img' => 'nullable|string'
            ]);

            // Nếu có lỗi validate, trả về lỗi
            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 422);
            }

            // Cập nhật thông tin phòng
            $room->update([
                'name' => $data['name'],
                'room_type_id' => $data['room_type_id'],
                'background_img' => $data['background_img'] ?? null,
            ]);

            // Tính capacity dựa trên số ghế liên kết với room_id
            $seatCount = Seat::where('room_id', $room->id)->count();
            $room->capacity = $seatCount;
            $room->save();

            // Trả về kết quả thành công
            return response()->json([
                'message' => 'Cập nhật phòng thành công',
                'room' => $room
            ], 200);
        } catch (\Exception $e) {
            // Nếu có lỗi, trả về thông tin lỗi (để debug)
            return response()->json([
                'error' => 'Đã xảy ra lỗi trong quá trình xử lý.',
                'details' => $e->getMessage()
            ], 500);
        }
    }




    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Tìm phòng theo ID
        $room = Room::find($id);

        if (!$room) {
            return response()->json(['message' => 'Không tìm thấy phòng'], 404);
        }

        // Kiểm tra xem phòng có suất chiếu hay không
        $hasShowTimes = ShowTime::where('room_id', $room->id)->exists();
        if ($hasShowTimes) {
            return response()->json([
                'message' => 'Không thể xóa phòng vì phòng đang có suất chiếu.'
            ], 403);
        }

        // Xóa mềm phòng
        $room->delete();

        return response()->json(['message' => 'Phòng đang bảo trì'], 200);
    }

    /**
     * Remove multiple rooms from storage.
     */
    public function destroyMultiple(Request $request)
    {
        // Lấy danh sách ID từ request
        $ids = $request->input('ids');

        if (empty($ids)) {
            return response()->json(['message' => 'Không có phòng nào được chọn'], 400);
        }

        // Kiểm tra xem có phòng nào trong danh sách đang có suất chiếu hay không
        $roomsWithShowTimes = ShowTime::whereIn('room_id', $ids)->pluck('room_id')->toArray();
        if (!empty($roomsWithShowTimes)) {
            return response()->json([
                'message' => 'Không thể xóa vì một số phòng đang có suất chiếu.',
                'rooms_with_showtimes' => $roomsWithShowTimes // Trả về danh sách ID phòng có suất chiếu (tùy chọn)
            ], 403);
        }

        $deleted = Room::whereIn('id', $ids)->delete();

        if ($deleted) {
            return response()->json(['message' => 'Phòng đang bảo trì'], 200);
        }

        return response()->json(['message' => 'Không tìm thấy phòng nào'], 404);
    }

    /**
     * Restore a soft-deleted room.
     */
    public function restore($id)
    {
        $room = Room::onlyTrashed()->find($id);

        if (!$room) {
            return response()->json(['message' => 'Không tìm thấy phòng đang bảo trì'], 404);
        }

        $room->restore(); // Khôi phục phòng

        return response()->json(['message' => 'Phòng đã bảo trì thành công'], 200);
    }
}
