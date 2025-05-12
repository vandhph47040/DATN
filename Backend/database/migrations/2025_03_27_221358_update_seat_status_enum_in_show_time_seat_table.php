<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('show_time_seat', function (Blueprint $table) {
            $table->enum('seat_status', ['available', 'booked', 'disabled', 'empty'])
                ->default('available')
                ->change();
        });
    }

    public function down(): void
    {
        Schema::table('show_time_seat', function (Blueprint $table) {
            $table->enum('seat_status', ['available', 'booked'])
                ->default('available')
                ->change();
        });
    }
};
