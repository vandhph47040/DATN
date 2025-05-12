<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Showtime;
use Carbon\Carbon;

class UpdateShowtimeStatus extends Command
{
    protected $signature = 'showtimes:update-status';
    protected $description = 'Cập nhật trạng thái show_times tự động dựa trên start_time và end_time';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
        $this->info('Bắt đầu cập nhật trạng thái show_times...');

        // Lấy thời gian hiện tại
        $now = Carbon::now();

        // Lấy tất cả suất chiếu có trạng thái coming_soon hoặc now_showing
        $showtimes = Showtime::whereIn('status', ['coming_soon', 'now_showing'])->get();

        foreach ($showtimes as $showtime) {
            $startTime = Carbon::parse($showtime->start_time);
            $endTime = Carbon::parse($showtime->end_time);

            // Kiểm tra trạng thái coming_soon -> now_showing
            if ($showtime->status === 'coming_soon' && $now->greaterThanOrEqualTo($startTime) && $now->lessThan($endTime)) {
                $showtime->status = 'now_showing';
                $showtime->save();
                $this->info("Suất chiếu {$showtime->id} đã được cập nhật thành now_showing (start_time: {$startTime->format('H:i d/m/Y')})");
            }

            // Kiểm tra trạng thái now_showing -> referenced
            if ($showtime->status === 'now_showing' && $now->greaterThanOrEqualTo($endTime)) {
                $showtime->status = 'referenced';
                $showtime->save();
                $this->info("Suất chiếu {$showtime->id} đã được cập nhật thành referenced (end_time: {$endTime->format('H:i d/m/Y')})");
            }
        }

        $this->info('Hoàn tất cập nhật trạng thái show_times.');
    }
}
