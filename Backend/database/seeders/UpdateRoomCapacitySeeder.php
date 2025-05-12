<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Room;
use App\Models\Seat;

class UpdateRoomCapacitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Lấy tất cả các phòng
        $rooms = Room::all();

        foreach ($rooms as $room) {
            // Tính số ghế liên kết với phòng
            $seatCount = Seat::where('room_id', $room->id)->count();

            // Cập nhật capacity cho phòng (chỉ nếu chưa có hoặc là 0)
            if ($room->capacity === null || $room->capacity === 0) {
                $room->update(['capacity' => $seatCount]);
            }
        }
    }
}
