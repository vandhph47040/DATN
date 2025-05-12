<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Thêm cột discount_code_id
            $table->unsignedBigInteger('discount_code_id')->nullable()->after('total_combo_price');

            // Thêm khóa ngoại liên kết với bảng discount_code
            $table->foreign('discount_code_id')->references('id')->on('discount_code')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Xóa khóa ngoại trước khi xóa cột
            $table->dropForeign(['discount_code_id']);
            $table->dropColumn('discount_code_id');
        });
    }
};
