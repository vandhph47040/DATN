<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class UpdateShowTimeSeatStatusField extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Đảm bảo dữ liệu hiện tại hợp lệ trước khi thay đổi enum
        DB::table('show_time_seat')
            ->whereNotIn('seat_status', ['available', 'booked'])
            ->update(['seat_status' => 'available']);

        // Thay đổi trường seat_status
        DB::statement("ALTER TABLE show_time_seat MODIFY COLUMN seat_status ENUM('available', 'booked') NOT NULL DEFAULT 'available'");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Khôi phục lại trường seat_status (giả định trạng thái trước đó)
        DB::statement("ALTER TABLE show_time_seat MODIFY COLUMN seat_status VARCHAR(255) DEFAULT 'available'");
    }
}
