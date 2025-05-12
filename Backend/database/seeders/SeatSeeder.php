<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SeatSeeder extends Seeder
{
    public function run()
    {
        $rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']; // Danh sách các hàng
        $columns = range(1, 20); // Các cột từ 1 đến 13
        $room_id = 18; // Giả sử phòng ID là 1

        $seats = [];

        foreach ($rows as $row) {
            // Xác định seat_type_id theo hàng
            if (in_array($row, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'])) {
                $seat_type_id = 2;
            } else {
                $seat_type_id = 1;
            }

            foreach ($columns as $column) {
                $seats[] = [
                    'room_id' => $room_id,
                    'row' => $row,
                    'column' => $column,
                    'seat_type_id' => $seat_type_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        DB::table('seats')->insert($seats);
    }
}
