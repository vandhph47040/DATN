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
        Schema::table('users', function (Blueprint $table) {
            $table->decimal('total_spent', 15, 2)->default(0)->after('phone'); // Tổng số tiền đã chi (VND)
            $table->string('rank')->default('regular')->after('total_spent'); // Hạng: regular, gold, diamond
            $table->integer('points')->default(0)->after('rank'); // Tổng điểm hiện tại
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['total_spent', 'rank', 'points']);
        });
    }
};
