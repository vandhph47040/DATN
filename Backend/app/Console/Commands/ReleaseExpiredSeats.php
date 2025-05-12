<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use App\Events\SeatHeldEvent;

class ReleaseExpiredSeats extends Command
{
    protected $signature = 'seats:release-expired';
    protected $description = 'Giải phóng các ghế đã hết hạn';

    public function handle()
    {
        $heldSeats = Cache::get('held_seats', []);

        $now = now();
        foreach ($heldSeats as $seat => $data) {
            if ($now->greaterThan($data['expires_at'])) {
                // Lấy roomId và showTimeId từ $data
                $roomId = $data['room_id'] ?? null;
                $showTimeId = $data['showtime_id'] ?? null;

                unset($heldSeats[$seat]);

                // Phát sự kiện cập nhật ghế qua Pusher với roomId và showTimeId
                broadcast(new SeatHeldEvent($seat, null, $roomId, $showTimeId, 'released'))->toOthers();
            }
        }

        Cache::put('held_seats', $heldSeats, now()->addMinutes(5));

        $this->info('Đã giải phóng các ghế hết hạn!');
    }
}
