<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        \App\Console\Commands\UpdateMovieStatus::class,
        \App\Console\Commands\UpdateShowtimeStatus::class,
    ];

    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Giữ nguyên
        // $schedule->command('inspire')->hourly();
        // $schedule->job(new \App\Jobs\ReleaseExpiredSeats)->everyMinute();
        $schedule->command('seats:release-expired')->everyMinute();

        // Thêm logic mới
        // Cập nhật movie_status mỗi ngày lúc 00:00
        $schedule->command('movies:update-status')
            ->dailyAt('00:00')
            ->timezone('Asia/Ho_Chi_Minh');

        // Cập nhật show_times mỗi phút
        $schedule->command('showtimes:update-status')
            ->everyMinute()
            ->timezone('Asia/Ho_Chi_Minh');
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
