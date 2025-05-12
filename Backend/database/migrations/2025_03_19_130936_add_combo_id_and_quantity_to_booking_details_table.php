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
        Schema::table('booking_details', function (Blueprint $table) {
            $table->unsignedBigInteger('combo_id')->nullable()->after('seat_id');
            $table->integer('quantity')->default(1)->after('price');
            
            // Thêm khóa ngoại cho combo_id
            $table->foreign('combo_id')->references('id')->on('combos')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('booking_details', function (Blueprint $table) {
            // Xóa khóa ngoại trước
            $table->dropForeign(['combo_id']);
            // Xóa cột
            $table->dropColumn('combo_id');
            $table->dropColumn('quantity');
        });
    }
};
