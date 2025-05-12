<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Imports\MoviesImport;
use App\Models\BookingDetail;
use App\Models\CalendarShow;
use App\Models\Movies;
use App\Models\Room;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Excel as ExcelExcel;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class MoviesController extends Controller
{
    // Xếp hạng phim theo số vé bán ra (dành cho trang chủ)
    public function moviesRanking(Request $request)
    {
        // Lấy ngày hiện tại và ngày đầu tiên của năm
        $currentDate = Carbon::today(); // Hôm nay (ví dụ: 2025-04-21)
        $startDate = Carbon::today()->startOfYear(); // 1/1 của năm hiện tại (ví dụ: 2025-01-01)

        // 1. Lấy danh sách phim xếp hạng theo số vé bán ra
        $movieRankings = CalendarShow::where('show_date', '>=', $startDate)
            ->where(function ($q) use ($currentDate) {
                $q->where('end_date', '>=', $currentDate)
                    ->orWhereNull('end_date'); // Lịch chiếu chưa kết thúc
            })
            ->join('movies', 'calendar_show.movie_id', '=', 'movies.id')
            ->leftJoin('show_times', 'calendar_show.id', '=', 'show_times.calendar_show_id')
            ->leftJoin('bookings', 'show_times.id', '=', 'bookings.showtime_id')
            ->leftJoin('booking_details', 'bookings.id', '=', 'booking_details.booking_id')
            ->whereNotNull('booking_details.seat_id') // Chỉ tính vé đã đặt
            ->select('movies.id', 'movies.title', 'movies.poster')
            ->selectRaw('COALESCE(COUNT(booking_details.seat_id), 0) as total_tickets')
            ->groupBy('movies.id', 'movies.title', 'movies.poster')
            ->orderByDesc('total_tickets')
            ->orderBy('movies.id')
            ->take(9)
            ->get()
            ->map(function ($item, $index) {
                return [
                    'id' => $item->id,
                    'rank' => $index + 1,
                    'movie_title' => $item->title,
                    'total_tickets' => (int) $item->total_tickets,
                    'poster' => $item->poster,
                ];
            });

        // Lấy danh sách ID phim đã có trong xếp hạng vé
        $ticketedMovieIds = $movieRankings->pluck('movie_title')->toArray();

        // 2. Lấy danh sách phim mới, loại bỏ các phim đã có trong xếp hạng vé
        $newMovies = Movies::select('id', 'title', 'poster')
            ->whereNotIn('title', $ticketedMovieIds) // Loại bỏ phim đã có trong xếp hạng
            ->orderBy('release_date', 'desc') // Hoặc 'created_at' nếu không có release_date
            ->take(9 - $movieRankings->count()) // Lấy đủ số phim để tổng là 9
            ->get()
            ->map(function ($item, $index) use ($movieRankings) {
                return [
                    'id' => $item->id,
                    'rank' => $movieRankings->count() + $index + 1, // Tiếp tục xếp hạng từ sau danh sách vé
                    'movie_title' => $item->title,
                    'total_tickets' => 0, // Phim mới không có vé
                    'poster' => $item->poster,
                ];
            });

        // 3. Ghép danh sách phim xếp hạng vé và phim mới
        $combinedResults = $movieRankings->concat($newMovies)->values();

        // Trả về phản hồi API
        return response()->json([
            'message' => 'Xếp hạng phim và danh sách phim mới',
            'data' => $combinedResults,
        ]);
    }

    // Lấy danh sách phim cùng thể loại (trừ phim hiện tại)
    public function relatedMovies($movieId)
    {
        // Tìm phim hiện tại dựa trên ID
        $currentMovie = Movies::with('genres')->find($movieId);

        if (!$currentMovie) {
            return response()->json([
                'message' => 'Phim không tồn tại',
            ], 404);
        }

        // Lấy danh sách ID thể loại của phim hiện tại
        $genreIds = $currentMovie->genres->pluck('id');

        if ($genreIds->isEmpty()) {
            return response()->json([
                'message' => 'Phim không có thể loại',
                'data' => [],
            ]);
        }

        // Lấy danh sách phim cùng thể loại, trừ phim hiện tại
        $relatedMovies = Movies::where('id', '!=', $movieId)
            ->whereHas('genres', function ($query) use ($genreIds) {
                $query->whereIn('genres.id', $genreIds);
            })
            ->select('id', 'title', 'poster', 'release_date')
            ->get()
            ->map(function ($movie) {
                return [
                    'id' => $movie->id,
                    'movie_title' => $movie->title,
                    'poster' => $movie->poster,
                    'release_date' => $movie->release_date ? Carbon::parse($movie->release_date)->format('d/m/Y') : null,
                ];
            });

        // Trả về phản hồi API
        return response()->json([
            'message' => 'Danh sách phim cùng thể loại',
            'data' => $relatedMovies,
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        //Hiển thị tất cả phim
        $movies = Movies::query()->latest('id')->with(['genres:id,name_genre', 'actors:id,name_actor', 'directors:id,name_director'])->get();


        //Hiển thị phim sắp chiếu
        $coming_soon = Movies::where('movie_status', 'coming_soon')->with(['genres:id,name_genre', 'actors:id,name_actor', 'directors:id,name_director'])->get();

        //Hiển thị phim đang chiếu
        $now_showing = Movies::where('movie_status', 'now_showing')->with(['genres:id,name_genre', 'actors:id,name_actor', 'directors:id,name_director'])->get();

        // Hiển thị phim đã bị xóa mềm
        $trashedMovies = Movies::onlyTrashed()->with(['genres:id,name_genre', 'actors:id,name_actor', 'directors:id,name_director'])->get();

        return response()->json([
            'movies' => $movies,
            'coming_soon' => $coming_soon,
            'now_showing' => $now_showing,
            'trashed_movies' => $trashedMovies,
        ], 200);
    }

    /**
     * Lấy danh sách phim cho client
     */
    public function getMoviesForClient(Request $request)
    {
        // Lấy các tham số từ query string
        $status = $request->query('status'); // Lọc theo trạng thái (now_showing, coming_soon)
        $genres = $request->query('genres'); // Lọc theo thể loại
        $sort = $request->query('sort', 'latest'); // Sắp xếp (mặc định: mới nhất)

        // Khởi tạo query cơ bản
        $query = Movies::query()
            ->with(['genres:id,name_genre', 'actors:id,name_actor', 'directors:id,name_director']);

        // Lọc theo trạng thái nếu có
        if ($status) {
            $query->where('movie_status', $status);
        }

        // Lọc theo thể loại nếu có
        if ($genres) {
            $genreList = explode(',', $genres);
            $query->whereHas('genres', function ($q) use ($genreList) {
                $q->whereIn('name_genre', $genreList);
            });
        }

        // Sắp xếp
        if ($sort === 'latest') {
            $query->latest('id');
        } elseif ($sort === 'oldest') {
            $query->oldest('id');
        }

        // Lấy danh sách phim
        $movies = $query->get();

        // Trả về danh sách phim
        return response()->json([
            'message' => 'Danh sách phim',
            'data' => $movies,
        ], 200);
    }

    public function store(Request $request)
    {

        // Validate dữ liệu
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255|unique:movies,title',
            'director_id' => 'required|exists:directors,id',
            'release_date' => 'required|date_format:Y-m-d',
            'running_time' => 'required|string',
            'language' => 'required|string|max:100',
            'rated' => 'required|string|max:255',
            'description' => 'nullable|string|unique:movies,trailer',
            'poster' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'trailer' => 'nullable|string',
            'movie_status' => 'required|in:coming_soon,now_showing',
            'name_actors' => 'required|array',
            'name_genres' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }
        // Tìm id của diễn viên từ tên
        $actorIds = DB::table('actors')->whereIn('name_actor', $request->name_actors)->pluck('id')->toArray();

        // Tìm id của thể loại từ tên
        $genreIds = DB::table('genres')->whereIn('name_genre', $request->name_genres)->pluck('id')->toArray();

        // Nếu không tìm thấy diễn viên
        if (count($actorIds) != count($request->name_actors)) {
            return response()->json(['message' => 'Không tìm thấy diễn viên'], 404);
        }

        // Nếu không tìm thấy thể loại
        if (count($genreIds) != count($request->name_genres)) {
            return response()->json(['message' => 'Không tìm thấy thể loại'], 404);
        }

        // Lấy dữ liệu phim hợp lệ từ request
        $movieData = $request->all();

        // Xử lý upload poster nếu có
        if (isset($movieData['poster']) && $movieData['poster'] instanceof \Illuminate\Http\UploadedFile) {
            $posterPath = $movieData['poster']->store('image', 'public');
            $movieData['poster'] = Storage::url($posterPath);
        }

        // Chuẩn bị dữ liệu để chèn vào database
        $movieToInsert = [
            'title' => $movieData['title'],
            'director_id' => $movieData['director_id'], // check it
            'release_date' => $movieData['release_date'],
            'running_time' => $movieData['running_time'],
            'language' => $movieData['language'],
            'rated' => $movieData['rated'],
            'description' => $movieData['description'] ?? null,
            'poster' => $movieData['poster'] ?? null,
            'trailer' => $movieData['trailer'] ?? null,
            'movie_status' => $movieData['movie_status'],
        ];

        // Thêm phim
        $movie = Movies::query()->create($movieToInsert);

        // Thêm diễn viên và thể loại cho phim
        $movie->actors()->sync($actorIds);
        $movie->genres()->sync($genreIds);

        return response()->json(['message' => 'Thêm phim thành công', 'data' => $movie], 201);
    }

    //Import dữ liệu từ excel
    public function import(Request $request)
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'excel_file' => 'required|mimes:xlsx,xls|max:2048',
            'posters.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        try {
            // Lưu file ảnh vào storage và lấy đường dẫn
            $posterPaths = [];
            if ($request->hasFile('posters')) {
                foreach ($request->file('posters') as $poster) {
                    $originalName = $poster->getClientOriginalName();
                    $path = $poster->store('images', 'public');
                    $posterPaths[$originalName] = Storage::url($path);
                }
                // Log::info('Đường dẫn poster đã tải lên: ' . json_encode($posterPaths));
            }

            // Import Excel với dữ liệu ảnh
            Excel::import(new MoviesImport($posterPaths), $request->file('excel_file'));

            return response()->json(['message' => 'Import phim thành công'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Lỗi khi import: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Tải về template Excel mẫu để nhập phim
     */
    public function downloadTemplateExcel()
    {
        try {
            $templateData = [
                [
                    'title' => 'Ví dụ: Kimetsu no yaiba',
                    'director' => 'Ví dụ: Hayao Miyazaki',
                    'release_date' => 'Ví dụ: 2023-04-26',
                    'running_time' => 'Ví dụ: 181 phút',
                    'language' => 'Ví dụ: Tiếng Nhật',
                    'rated' => 'Ví dụ: PG-13',
                    'description' => 'Ví dụ: Một bộ phim hành động phiêu lưu',
                    'poster' => 'Ví dụ: kimetsu_no_yaiba.jpg',
                    'trailer' => 'Ví dụ: https://www.youtube.com/watch?v=example',
                    'movie_status' => 'Ví dụ: now_showing',
                    'actors' => 'Ví dụ: Kamado Tanjirou, Zenitsu Agatsuma, Songoku',
                    'genres' => 'Ví dụ: Hành động, Hài hước, Phiêu lưu, hoạt hình',
                ]
            ];

            return Excel::download(new class($templateData) implements \Maatwebsite\Excel\Concerns\FromArray, \Maatwebsite\Excel\Concerns\WithHeadings, \Maatwebsite\Excel\Concerns\WithStyles {
                protected $data;

                public function __construct(array $data)
                {
                    $this->data = $data;
                }

                public function array(): array
                {
                    return $this->data;
                }

                public function headings(): array
                {
                    return [
                        'title',
                        'director',
                        'release_date',
                        'running_time',
                        'language',
                        'rated',
                        'description',
                        'poster',
                        'trailer',
                        'movie_status',
                        'actors',
                        'genres',
                    ];
                }

                public function styles(Worksheet $sheet)
                {
                    return [
                        // In đậm và đổi màu nền cho hàng tiêu đề
                        1 => ['font' => ['bold' => true], 'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFCCCCCC']]],
                    ];
                }
            }, 'movie_import_template.xlsx');
        } catch (\Exception $e) {
            return response()->json(['error' => 'Lỗi khi tạo template: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {


        //Tìm phim theo id và lấy thông tin liên quan (Actors, Genres, Director)
        $movie = Movies::with(['genres:id,name_genre', 'actors:id,name_actor', 'directors:id,name_director'])->find($id);

        //nếu không tìm thấy trả về 404
        if (!$movie) {
            return response()->json([
                'message' => 'Không tìm thấy phim này',
            ], 404);
        }

        //trả về chi tiết phim
        return response()->json([
            'message' => 'Thông tin chi tiết phim',
            'data' => $movie
        ], 200);
    }

    public function showMovieDestroy(string $id)
    {


        //Tìm phim theo id và lấy thông tin liên quan (Actors, Genres, Director)
        $movie = Movies::onlyTrashed()->with(['genres:id,name_genre', 'actors:id,name_actor', 'directors:id,name_director'])->find($id);

        //nếu không tìm thấy trả về 404
        if (!$movie) {
            return response()->json([
                'message' => 'Không tìm thấy phim này',
            ], 404);
        }

        //trả về chi tiết phim
        return response()->json([
            'message' => 'Thông tin chi tiết phim',
            'data' => $movie
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {


        //Tìm phim theo id
        $movie = Movies::find($id);

        //Nếu không tìm thấy phim trả về 404
        if (!$movie) {
            return response()->json([
                'message' => 'Không tìm thấy phim này',
            ], 404);
        }

        //Lấy dữ liệu phim hợp lệ từ request
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255|unique:movies,title,' . $id,
            'director_id' => 'required|exists:directors,id',
            'release_date' => 'required|date_format:Y-m-d',
            'running_time' => 'required|string',
            'language' => 'required|string|max:100',
            'rated' => 'required|string|max:255',
            'description' => 'nullable|string|unique:movies,trailer',
            'poster' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'trailer' => 'nullable|string',
            'movie_status' => 'required|in:coming_soon,now_showing',
            'name_actors' => 'required|array',
            'name_genres' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $movieData = $request->all();

        //Xủ lý upload poster nếu có
        if (isset($movieData['poster']) && $movieData['poster'] instanceof \Illuminate\Http\UploadedFile) {
            $posterPath = $movieData['poster']->store('image', 'public');
            $movieData['poster'] = Storage::url($posterPath);
        }

        //Cập nhật thông tin phim
        $movie->update($movieData);

        //Tìm id của diễn viên từ tên
        if (isset($movieData['name_actors']) && is_array($movieData['name_actors'])) {
            $actorIds = DB::table('actors')->whereIn('name_actor', $movieData['name_actors'])->pluck('id')->toArray();

            // Nếu không tìm thấy diễn viên
            if (count($actorIds) != count($movieData['name_actors'])) {
                return response()->json(['message' => 'Không tìm thấy diễn viên'], 404);
            }

            // Cập nhật diễn viên cho phim
            $movie->actors()->sync($actorIds); // Xóa và thêm lại
        }

        // Tìm id của thể loại từ tên
        if (isset($movieData['name_genres']) && is_array($movieData['name_genres'])) {
            $genreIds = DB::table('genres')->whereIn('name_genre', $movieData['name_genres'])->pluck('id')->toArray();

            // Nếu không tìm thấy thể loại
            if (count($genreIds) != count($movieData['name_genres'])) {
                return response()->json(['message' => 'Không tìm thấy thể loại'], 404);
            }

            // Cập nhật thể loại cho phim
            $movie->genres()->sync($genreIds); // Xóa và thêm lại   
        }

        return response()->json([
            'message' => 'Cập nhật phim thành công',
            'data' => $movie,
        ], 200);
    }


    /**
     * Kiểm tra xem phim có lịch chiếu hiện tại hoặc tương lai hay không
     */
    private function hasCalendarShow($movieIds)
    {
        $currentTime = now(); // Lấy thời gian hiện tại

        if (is_array($movieIds)) {
            return DB::table('calendar_show')
                ->whereIn('movie_id', $movieIds)
                ->whereExists(function ($query) use ($currentTime) {
                    $query->select(DB::raw(1))
                        ->from('show_times')
                        ->whereColumn('calendar_show.id', 'show_times.calendar_show_id')
                        ->where('show_times.end_time', '>=', $currentTime); // Lịch chiếu hiện tại hoặc tương lai
                })
                ->exists();
        }

        return DB::table('calendar_show')
            ->where('movie_id', $movieIds)
            ->whereExists(function ($query) use ($currentTime) {
                $query->select(DB::raw(1))
                    ->from('show_times')
                    ->whereColumn('calendar_show.id', 'show_times.calendar_show_id')
                    ->where('show_times.end_time', '>=', $currentTime); // Lịch chiếu hiện tại hoặc tương lai
            })
            ->exists();
    }

    /**
     * Xóa mềm nhiều phim.
     */
    public function destroyMultiple(Request $request)
    {

        $ids = $request->input('ids'); // Lấy danh sách id phim cần xóa

        // Nếu không có phim nào được chọn
        if (empty($ids)) {
            return response()->json(['message' => 'Không có phim nào được chọn'], 400);
        }

        if ($this->hasCalendarShow($ids)) {
            return response()->json(['message' => 'Không thể xóa vì một hoặc nhiều phim đang có lịch chiếu'], 400);
        }

        //Xóa mềm các phim được chọn
        $deleted = Movies::whereIn('id', $ids)->delete();

        //Kiểm tra xem có phim nào được xóa không
        if ($deleted) {
            return response()->json(['message' => 'Xóa phim thành công'], 200);
        }

        return response()->json(['message' => 'Không tìm thấy phim nào'], 404);
    }

    /**
     * Xóa một phim (soft delete)
     */
    public function destroy($id)
    {
        try {
            // Tìm phim theo ID
            $movie = Movies::findOrFail($id);

            // Kiểm tra xem phim có lịch chiếu hiện tại hoặc tương lai không
            if ($this->hasCalendarShow($id)) {
                return response()->json([
                    'message' => 'Không thể xóa phim vì phim đang có lịch chiếu hiện tại hoặc tương lai'
                ], 400);
            }

            // Xóa phim
            $movie->delete();

            // Trả về phản hồi thành công
            return response()->json(['message' => 'Xóa phim thành công'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi khi xóa phim: ' . $e->getMessage()], 500);
        }
    }


    public function restore($id)
    {


        $room = Room::onlyTrashed()->find($id);

        if (!$room) {
            return response()->json(['message' => 'Không tìm thấy phòng đã bị xóa'], 404);
        }

        $room->restore(); // Khôi phục phòng

        return response()->json(['message' => 'Khôi phục phòng thành công'], 200);
    }

    //Xóa vĩnh viễn nhiều phim
    // public function forceDeleteMultiple(Request $request)
    // {

    //     $ids = $request->input('ids'); // Lấy danh sách id phim cần xóa

    //     // Nếu không có phim nào được chọn
    //     if (empty($ids)) {
    //         return response()->json(['message' => 'Không có phim nào được chọn'], 400);
    //     }

    //     if ($this->hasCalendarShow($ids)) {
    //         return response()->json(['message' => 'Không thể xóa vĩnh viễn vì một hoặc nhiều phim đang có lịch chiếu'], 400);
    //     }

    //     //Xóa vĩnh viễn các phim được chọn
    //     $deleted = Movies::onlyTrashed()->whereIn('id', $ids)->forceDelete();

    //     //Kiểm tra xem có phim nào được xóa không
    //     if ($deleted) {
    //         return response()->json(['message' => 'Xóa vĩnh viễn phim thành công'], 200);
    //     }

    //     return response()->json(['message' => 'Không tìm thấy phim nào'], 404);
    // }

    // //Xóa vĩnh viễn 1 phim
    // public function forceDeleteSingle($id)
    // {

    //     // Tìm phim đã xóa mềm theo ID
    //     $movie = Movies::onlyTrashed()->find($id);

    //     // Kiểm tra nếu không tìm thấy phim
    //     if (!$movie) {
    //         return response()->json(['message' => 'Phim không tồn tại hoặc đã bị xóa vĩnh viễn'], 404);
    //     }

    //     if ($this->hasCalendarShow($id)) {
    //         return response()->json(['message' => 'Không thể xóa vĩnh viễn phim vì phim đang có lịch chiếu'], 400);
    //     }

    //     // Xóa vĩnh viễn phim
    //     $movie->forceDelete();

    //     // Trả về phản hồi thành công
    //     return response()->json(['message' => 'Xóa vĩnh viễn phim thành công'], 200);
    // }

    /**
     * Tìm kiếm phim theo tiêu đề, diễn viên hoặc đạo diễn
     */
    public function searchMovies(Request $request)
    {
        // Lấy từ khóa tìm kiếm từ query string
        $keyword = $request->query('keyword');
        $status = $request->query('status'); // Lọc theo trạng thái nếu có

        // Kiểm tra nếu không có từ khóa
        if (empty($keyword)) {
            return response()->json(['message' => 'Vui lòng nhập từ khóa tìm kiếm'], 400);
        }

        // Khởi tạo query tìm kiếm
        $query = Movies::query()
            ->with(['genres:id,name_genre', 'actors:id,name_actor', 'directors:id,name_director']);

        // Tìm kiếm theo tiêu đề, diễn viên hoặc đạo diễn
        $query->where(function ($q) use ($keyword) {
            $q->where('title', 'LIKE', '%' . $keyword . '%')
                ->orWhereHas('actors', function ($q) use ($keyword) {
                    $q->where('name_actor', 'LIKE', '%' . $keyword . '%');
                })
                ->orWhereHas('directors', function ($q) use ($keyword) {
                    $q->where('name_director', 'LIKE', '%' . $keyword . '%');
                });
        });

        // Lọc theo trạng thái nếu có
        if ($status) {
            $query->where('movie_status', $status);
        }

        // Lấy danh sách phim
        $movies = $query->get();

        // Nếu không tìm thấy phim
        if ($movies->isEmpty()) {
            return response()->json(['message' => 'Không tìm thấy phim nào khớp với từ khóa'], 404);
        }

        return response()->json([
            'message' => 'Kết quả tìm kiếm phim',
            'data' => $movies,
        ], 200);
    }

    /**
     * Lọc phim theo nhiều tiêu chí
     * 
     */
    public function filterMovies(Request $request)
    {
        // Lấy các tham số từ query string
        $genres = $request->query('genres'); // Lọc theo thể loại
        $status = $request->query('status'); // Lọc theo trạng thái (now_showing, coming_soon)
        $releaseYear = $request->query('release_year'); // Lọc theo năm phát hành
        $language = $request->query('language'); // Lọc theo ngôn ngữ

        // Khởi tạo query cơ bản
        $query = Movies::query()
            ->with(['genres:id,name_genre', 'actors:id,name_actor', 'directors:id,name_director']);

        // Lọc theo thể loại nếu có
        if ($genres) {
            $genreList = explode(',', $genres);
            $query->whereHas('genres', function ($q) use ($genreList) {
                $q->whereIn('name_genre', $genreList);
            });
        }

        // Lọc theo trạng thái nếu có
        if ($status) {
            $query->where('movie_status', $status);
        }

        // Lọc theo năm phát hành nếu có
        if ($releaseYear) {
            $query->whereYear('release_date', $releaseYear);
        }

        // Lọc theo ngôn ngữ nếu có
        if ($language) {
            $query->where('language', $language);
        }

        // Lấy danh sách phim
        $movies = $query->latest('id')->get();

        // Nếu không tìm thấy phim
        if ($movies->isEmpty()) {
            return response()->json(['message' => 'Không tìm thấy phim nào khớp với tiêu chí lọc'], 404);
        }

        return response()->json([
            'message' => 'Danh sách phim theo tiêu chí lọc',
            'data' => $movies,
        ], 200);
    }
}
