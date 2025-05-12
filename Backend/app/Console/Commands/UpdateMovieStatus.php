<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Movies;
use App\Models\CalendarShow;
use Carbon\Carbon;

class UpdateMovieStatus extends Command
{
    protected $signature = 'movies:update-status';
    protected $description = 'Cập nhật trạng thái movie_status tự động dựa trên show_date và end_date';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
        $this->info('Bắt đầu cập nhật trạng thái movie_status...');

        // Lấy thời gian hiện tại
        $now = Carbon::now()->startOfDay(); // 26/03/2025 00:00:00

        // Lấy tất cả phim có trạng thái coming_soon hoặc now_showing
        $movies = Movies::whereIn('movie_status', ['coming_soon', 'now_showing'])->get();

        foreach ($movies as $movie) {
            // Lấy lịch chiếu sớm nhất và muộn nhất của phim
            $calendarShow = CalendarShow::where('movie_id', $movie->id)
                ->orderBy('show_date', 'asc')
                ->first();

            if (!$calendarShow) {
                continue; // Nếu không có lịch chiếu, bỏ qua
            }

            $showDate = Carbon::parse($calendarShow->show_date)->startOfDay();
            $endDate = $calendarShow->end_date ? Carbon::parse($calendarShow->end_date)->startOfDay() : null;

            // Kiểm tra trạng thái coming_soon -> now_showing
            if ($movie->movie_status === 'coming_soon' && $showDate->isToday()) {
                $movie->movie_status = 'now_showing';
                $movie->save();
                $this->info("Phim {$movie->title} đã được cập nhật thành now_showing (show_date: {$showDate->format('d/m/Y')})");
            }

            // Kiểm tra trạng thái now_showing -> coming_soon (khi đến end_date)
            if ($movie->movie_status === 'now_showing' && $endDate && $endDate->isToday()) {
                $movie->movie_status = 'coming_soon';
                $movie->save();
                $this->info("Phim {$movie->title} đã được cập nhật thành coming_soon (end_date: {$endDate->format('d/m/Y')})");
            }
        }

        $this->info('Hoàn tất cập nhật trạng thái movie_status.');
    }
}
