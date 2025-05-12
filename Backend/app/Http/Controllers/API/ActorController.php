<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Actor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;

class ActorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        //Danh sách diễn viên
        $actors = Actor::query()->latest('id')->get();

        return response()->json($actors, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {

        // Validate dữ liệu
        $validator = Validator::make($request->all(), [
            'name_actor' => 'required|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        //Lấy dữ liệu diễn viên
        $data = $request->all();

        //Thêm diễn viên mới

        $actor = Actor::query()->create($data);

        return response()->json(['message' => 'Thêm diễn viên thành công', 'data' => $actor], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {


        // Tìm diễn viên theo id
        $actor = Actor::find($id);

        // Nếu không tìm thấy diễn viên
        if (!$actor) {
            return response()->json(['message' => 'Diễn viên không tồn tại'], 404);
        }

        return response()->json($actor, 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {


        // Tìm diễn viên theo id
        $actor = Actor::find($id);

        // Nếu không tìm thấy diễn viên
        if (!$actor) {
            return response()->json(['message' => 'Diễn viên không tồn tại'], 404);
        }

        // Validate dữ liệu
        $validator = Validator::make($request->all(), [
            'name_actor' => 'required|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        //Lấy dữ liệu diễn viên
        $data = $request->all();

        // Cập nhật diễn viên
        $actor->update($data);

        return response()->json(['message' => 'Cập nhật diễn viên thành công', 'data' => $actor], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {


        // Tìm diễn viên theo id
        $actor = Actor::find($id);

        // Nếu không tìm thấy diễn viên
        if (!$actor) {
            return response()->json(['message' => 'Diễn viên không tồn tại'], 404);
        }

        // Kiểm tra xem diễn viên có tham gia trong phim nào đang chiếu hoặc sắp chiếu không
        $movies = $actor->movies()
            ->whereIn('movie_status', ['now_showing', 'coming_soon'])
            ->get();

        // Nếu diễn viên đang tham gia trong phim đang chiếu hoặc sắp chiếu
        if ($movies->isNotEmpty()) {
            return response()->json([
                'message' => 'Không thể xóa diễn viên vì diễn viên đang tham gia trong một bộ phim đang chiếu hoặc sắp chiếu',
                'movies' => $movies->pluck('title') // Trả về danh sách tên phim để người dùng biết
            ], 403); // 403 Forbidden: Không được phép xóa
        }

        // Nếu không có phim nào đang chiếu hoặc sắp chiếu, tiến hành xóa diễn viên
        $actor->delete();

        return response()->json(['message' => 'Xóa diễn viên thành công'], 200);
    }
}
