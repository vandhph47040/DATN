<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\RoomType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RoomTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $room_types = RoomType::query()->latest('id')->get();

        return response()->json($room_types, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate dữ liệu
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0'

        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        //Lấy dữ liệu loại phòng
        $data = $request->all();

        //Thêm loại phòng mới

        $room_type = RoomType::query()->create($data);

        return response()->json(['message' => 'Thêm loại phòng thành công', 'data' => $room_type], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // Tìm loại phòng theo id
        $room_type = RoomType::find($id);

        // Nếu không tìm thấy loại phòng
        if (!$room_type) {
            return response()->json(['message' => 'loại phòng không tồn tại'], 404);
        }

        return response()->json($room_type, 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // Tìm loại phòng theo id
        $room_type = RoomType::find($id);

        // Nếu không tìm thấy loại phòng
        if (!$room_type) {
            return response()->json(['message' => 'loại phòng không tồn tại'], 404);
        }

        // Validate dữ liệu
        $validator = Validator::make($request->all(), [
            'name_d' => 'required|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        //Lấy dữ liệu loại phòng
        $data = $request->all();

        // Cập nhật loại phòng
        $room_type->update($data);

        return response()->json(['message' => 'Cập nhật loại phòng thành công', 'data' => $room_type], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Tìm loại phòng theo id
        $room_type = RoomType::find($id);

        // Nếu không tìm thấy loại phòng
        if (!$room_type) {
            return response()->json(['message' => 'loại phòng không tồn tại'], 404);
        }

        // Xóa loại phòng
        $room_type->delete();

        return response()->json(['message' => 'Xóa loại phòng thành công'], 200);
    }
}
