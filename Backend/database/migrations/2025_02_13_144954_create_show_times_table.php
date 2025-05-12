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
        Schema::create('show_times', function (Blueprint $table) {
            $table->id();

            $table->foreignId('calendar_show_id')->constrained('calendar_show');
            $table->foreignId('room_id')->constrained('rooms');
            $table->time('start_time');
            $table->time('end_time');
            $table->enum('status',['referenced','now_showing', 'coming_soon']);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('show_times');
    }
};
