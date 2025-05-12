<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class UpdateSeatsStatusField extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Đảm bảo dữ liệu hiện tại hợp lệ trước khi thay đổi enum
        DB::table('seats')
            ->whereNotIn('status', ['available', 'disabled', 'empty'])
            ->update(['status' => 'available']);

        // Thay đổi trường status
        DB::statement("ALTER TABLE seats MODIFY COLUMN status ENUM('available', 'disabled', 'empty') NOT NULL DEFAULT 'available'");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Khôi phục lại trường status
        DB::statement("ALTER TABLE seats MODIFY COLUMN status ENUM('available', 'empty') NOT NULL DEFAULT 'available'");
    }
}
