<?php

namespace Database\Seeders;

use App\Models\Seat;
use App\Models\ShowTime;
use App\Models\ShowTimeSeat;
use Illuminate\Database\Seeder;

class ShowTimeSeatSeeder extends Seeder
{
    public function run()
    {
        $showTimes = ShowTime::all();
        $seats = Seat::all();

        foreach ($showTimes as $showTime) {
            foreach ($seats as $seat) {
                ShowTimeSeat::firstOrCreate(
                    [
                        'show_time_id' => $showTime->id,
                        'seat_id' => $seat->id,
                    ],
                    [
                        'seat_status' => 'available',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        }
    }
}
