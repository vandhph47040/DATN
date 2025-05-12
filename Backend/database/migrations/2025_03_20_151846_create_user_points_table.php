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
        Schema::create('user_points', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Liên kết với bảng users
            $table->foreignId('booking_id')->nullable()->constrained()->onDelete('set null'); // Liên kết với bảng bookings
            $table->integer('points_earned'); // Số điểm kiếm được
            $table->string('description')->nullable(); // Mô tả giao dịch
            $table->timestamp('earned_at')->useCurrent(); // Thời điểm kiếm điểm

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_points');
    }
};
