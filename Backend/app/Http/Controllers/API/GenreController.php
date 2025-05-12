<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Genre;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;

class GenreController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {


        $genres = Genre::query()->latest('id')->get();

        return response()->json($genres, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {


        // Validate dữ liệu
        $validator = Validator::make($request->all(), [
            'name_genre' => 'required|string|max:255|unique:genres,name_genre',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        //Lấy dữ liệu thể loại phim
        $data = $request->all();

        // Thêm thể loại mới
        $genre = Genre::query()->create($data);

        return response()->json(['message' => 'Thêm thể loại phim thành công', 'data' => $genre], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {


        $genre = Genre::find($id);

        if (!$genre) {
            return response()->json(['message' => 'Thể loại phim không tồn tại'], 404);
        }

        return response()->json($genre, 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {


        $genre = Genre::find($id);

        if (!$genre) {
            return response()->json(['message' => 'Thể loại phim không tồn tại'], 404);
        }

        // Validate dữ liệu
        $validator = Validator::make($request->all(), [
            'name_genre' => 'required|string|max:255|unique:genres,name_genre',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        //Lấy dữ liệu thể loại phim
        $data = $request->all();

        // Cập nhật thể loại phim
        $genre->update($data);

        return response()->json(['message' => 'Cập nhật thể loại phim thành công', 'data' => $genre], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {


        // Tìm thể loại phim theo id
        $genre = Genre::find($id);

        // Nếu không tìm thấy thể loại phim
        if (!$genre) {
            return response()->json(['message' => 'Thể loại phim không tồn tại'], 404);
        }

        // Kiểm tra xem thể loại có tham gia trong phim nào đang chiếu hoặc sắp chiếu không
        $movies = $genre->movies()
            ->whereIn('movie_status', ['now_showing', 'coming_soon'])
            ->get();

        // Nếu thể loại đang tham gia trong phim đang chiếu hoặc sắp chiếu
        if ($movies->isNotEmpty()) {
            return response()->json([
                'message' => 'Không thể xóa thể loại vì một số phim đang chứa thể loại này',
                'movies' => $movies->pluck('title') // Trả về danh sách tên phim để người dùng biết
            ], 403); // 403 Forbidden: Không được phép xóa
        }

        // Nếu không có phim nào đang chiếu hoặc sắp chiếu, tiến hành xóa thể loại
        $genre->delete();

        return response()->json(['message' => 'Xóa thể loại phim thành công'], 200);
    }
}
