<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Director;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;

class DirectorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {


        // Danh sách đạo diễn
        $directors = Director::query()->latest('id')->get();

        return response()->json(
            $directors,
            200
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {


        // Validate dữ liệu
        $validator = Validator::make($request->all(), [
            'name_director' => 'required|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Lấy dữ liệu đạo diễn
        $data = $request->all();

        // Thêm đạo diễn mới
        $director = Director::query()->create($data);

        return response()->json(
            ['message' => 'Thêm đạo diễn thành công', 'data' => $director],
            201
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {


        // Tìm đạo diễn theo id
        $director = Director::find($id);

        // Nếu không tìm thấy đạo diễn
        if (!$director) {
            return response()->json(['message' => 'Đạo diễn không tồn tại'], 404);
        }

        return response()->json($director, 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {


        // Tìm đạo diễn theo id
        $director = Director::find($id);

        // Nếu không tìm thấy đạo diễn
        if (!$director) {
            return response()->json(['message' => 'Đạo diễn không tồn tại'], 404);
        }

        // Validate dữ liệu
        $validator = Validator::make($request->all(), [
            'name_director' => 'required|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Lấy dữ liệu đạo diễn
        $data = $request->all();

        // Cập nhật đạo diễn
        $director->update($data);

        return response()->json(['message' => 'Cập nhật đạo diễn thành công', 'data' => $director], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {


        // Tìm đạo diễn theo id
        $director = Director::find($id);

        // Nếu không tìm thấy đạo diễn
        if (!$director) {
            return response()->json(['message' => 'Đạo diễn không tồn tại'], 404);
        }

        // Kiểm tra xem đạo diễn có tham gia trong phim nào đang chiếu hoặc sắp chiếu không
        $movies = $director->movies()
            ->whereIn('movie_status', ['now_showing', 'coming_soon'])
            ->get();

        // Nếu đạo diễn đang tham gia trong phim đang chiếu hoặc sắp chiếu
        if ($movies->isNotEmpty()) {
            return response()->json([
                'message' => 'Không thể xóa đạo diễn vì đạo diễn đang tham gia trong một bộ phim đang chiếu hoặc sắp chiếu',
                'movies' => $movies->pluck('title') // Trả về danh sách tên phim để người dùng biết
            ], 403); // 403 Forbidden: Không được phép xóa
        }

        // Nếu không có phim nào đang chiếu hoặc sắp chiếu, tiến hành xóa đạo diễn
        $director->delete();

        return response()->json(['message' => 'Xóa đạo diễn thành công'], 200);
    }
}
