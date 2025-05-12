<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Đổi định nghĩa của cột check_in để bao gồm giá trị mới 'waiting'
        Schema::table('bookings', function (Blueprint $table) {
            $table->enum('check_in', ['absent', 'checked_in', 'waiting'])->default('waiting')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Khôi phục lại định nghĩa cũ của cột check_in (bỏ 'waiting')
        Schema::table('bookings', function (Blueprint $table) {
            $table->enum('check_in', ['absent', 'checked_in'])->default('absent')->change();
        });
    }
};
