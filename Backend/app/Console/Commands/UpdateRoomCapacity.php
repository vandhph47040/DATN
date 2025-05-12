<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Room;
use App\Models\Seat;

class UpdateRoomCapacity extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'room:update-capacity';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cập nhật capacity của các phòng dựa trên số ghế';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $rooms = Room::all();

        foreach ($rooms as $room) {
            $seatCount = Seat::where('room_id', $room->id)->count();
            if ($room->capacity === null || $room->capacity === 0) {
                $room->update(['capacity' => $seatCount]);
                $this->info("Cập nhật capacity cho phòng ID {$room->id} thành {$seatCount}");
            }
        }

        $this->info('Cập nhật capacity thành công cho tất cả các phòng!');
        return 0;
    }
}
